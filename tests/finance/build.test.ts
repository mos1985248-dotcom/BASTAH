import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMonthInput, type RawFinanceData } from "../../lib/finance/build";
import { summarizeMonth } from "../../lib/finance/engine";
import { d, ext, invoice, NOV } from "./helpers";

const raw = (over: Partial<RawFinanceData> = {}): RawFinanceData => ({
  vatMode: "UNSET", invoicesPaid: [], refunds: [], statusRefundedWithoutEvent: 0, trialCount: 0, freePlanCount: 0, shipments: [],
  failedOrReturnedDates: [], settlements: [], expenses: [], aiRows: [], aiInvoices: [], courierNames: {}, ...over,
});

test("البناء يفصل أشهر الفواتير ويُبقي السنوية ضمن 12 شهراً فقط", () => {
  const oldYearly = invoice("old", 120000, { cycle: "yearly", paidAt: d("2025-09-01T09:00:00Z") });   // أقدم من 12 شهراً
  const recentYearly = invoice("y", 120000, { cycle: "yearly", paidAt: d("2026-02-01T09:00:00Z") });
  const input = buildMonthInput(raw({ invoicesPaid: [oldYearly, recentYearly, invoice("m", 4900)] }), NOV);
  assert.deepEqual(input.subscriptions.paidInMonth.map((i) => i.id), ["m"]);
  assert.deepEqual(input.subscriptions.yearlyInCoverage.map((i) => i.id), ["y"]);
});

test("الشحنات التراكمية تُقتطع عند نهاية الشهر، وعدّاد الفاشلة بشهره بتوقيت الرياض", () => {
  const input = buildMonthInput(raw({
    shipments: [ext(), ext({ deliveredAt: d("2026-12-05T09:00:00Z") })],
    failedOrReturnedDates: [d("2026-10-31T21:30:00Z"), d("2026-10-31T20:30:00Z")],
  }), NOV);
  assert.equal(input.shipments.length, 1);
  assert.equal(input.failedOrReturnedInMonth, 1);
});

test("تجميع الذكاء الاصطناعي: مكتمل/ناقص/قديم بشهره فقط", () => {
  const rows = [
    { createdAt: d("2026-11-03T09:00:00Z"), storeId: "s1", feature: "chat", plan: "PRO", planIsCurrentFallback: false, status: "COMPLETE" as const, costMicro: 1_000_000, estimateMicro: 0 },
    { createdAt: d("2026-11-04T09:00:00Z"), storeId: "s1", feature: "chat", plan: "PRO", planIsCurrentFallback: false, status: "INCOMPLETE" as const, costMicro: 0, estimateMicro: 0 },
    { createdAt: d("2026-11-05T09:00:00Z"), storeId: "s1", feature: "chat", plan: "PRO", planIsCurrentFallback: false, status: "LEGACY" as const, costMicro: 0, estimateMicro: 400_000 },
    { createdAt: d("2026-10-05T09:00:00Z"), storeId: "s1", feature: "chat", plan: "PRO", planIsCurrentFallback: false, status: "COMPLETE" as const, costMicro: 9_000_000, estimateMicro: 0 },
  ];
  const s = summarizeMonth(buildMonthInput(raw({ aiRows: rows }), NOV));
  assert.equal(s.ai.provisionalUsdMicro, 1_400_000);
  assert.equal(s.ai.incompleteCount, 1);
  assert.equal(s.ai.legacyCount, 1);
});
