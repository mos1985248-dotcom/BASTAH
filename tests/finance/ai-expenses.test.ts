import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeMonth } from "../../lib/finance/engine";
import type { AiInvoiceIn, AiUsageGroupIn } from "../../lib/finance/types";
import { baseInput, d, expense, ext, IN_NOV, invoice } from "./helpers";

const usage = (over: Partial<AiUsageGroupIn> = {}): AiUsageGroupIn =>
  ({ storeId: "st1", feature: "chat", plan: "LAUNCH", planIsCurrentFallback: false, count: 10, completeCostMicro: 2_000_000, incompleteCount: 0, legacyCount: 0, legacyEstimateMicro: 0, ...over });
const aiInvoice = (over: Partial<AiInvoiceIn> = {}): AiInvoiceIn =>
  ({ id: "a1", provider: "anthropic", kind: "USAGE_INVOICE", periodStart: d("2026-10-31T21:00:00Z"), periodEnd: d("2026-11-30T21:00:00Z"), amountUsdMicro: 3_000_000, fxSarPerUsd: 3.75, fxDate: IN_NOV, paidAt: null, ...over });

test("AI: المحسوب مؤقتاً مصدر الشهر عند غياب الفاتورة الموثقة، ويُحوَّل بسعر صرف موثَّق فقط", () => {
  const s = summarizeMonth(baseInput({ ai: { usage: [usage()], invoices: [aiInvoice({ kind: "PREPAID_TOPUP", periodStart: null, periodEnd: null, paidAt: IN_NOV, amountUsdMicro: 100_000_000 })] } }));
  assert.equal(s.ai.source, "PROVISIONAL");
  assert.equal(s.ai.costUsdMicro, 2_000_000);
  assert.equal(s.ai.costSarMinor, 750); // 2$ × 3.75
});

test("AI: الفاتورة الموثقة تحلّ محل المحسوب (مصدر واحد) ويظهر فرق المطابقة، دون جمعهما", () => {
  const s = summarizeMonth(baseInput({ ai: { usage: [usage()], invoices: [aiInvoice()] } }));
  assert.equal(s.ai.source, "DOCUMENTED");
  assert.equal(s.ai.costUsdMicro, 3_000_000);
  assert.equal(s.ai.provisionalUsdMicro, 2_000_000);
  assert.equal(s.ai.reconciliationDiffUsdMicro, 1_000_000);
});

test("AI: شحن الرصيد المسبق تدفق نقدي فقط وليس استهلاكاً في يوم الشحن", () => {
  const topup = aiInvoice({ id: "t1", kind: "PREPAID_TOPUP", periodStart: null, periodEnd: null, paidAt: IN_NOV, amountUsdMicro: 100_000_000 });
  const s = summarizeMonth(baseInput({ ai: { usage: [usage()], invoices: [topup] } }));
  assert.equal(s.ai.cashOutUsdMicro, 100_000_000);
  assert.equal(s.ai.cashOutSarMinor, 37500);
  assert.equal(s.ai.costUsdMicro, 2_000_000); // الاستهلاك لا 100$
});

test("AI: سجل ناقص السعر «غير مكتمل» ولا يُحسب صفراً ولا يُقدَّر", () => {
  const s = summarizeMonth(baseInput({ ai: { usage: [usage({ completeCostMicro: 0, incompleteCount: 4 })], invoices: [aiInvoice({ kind: "PREPAID_TOPUP", periodStart: null, periodEnd: null, paidAt: IN_NOV, amountUsdMicro: 1_000_000 })] } }));
  assert.equal(s.ai.incompleteCount, 4);
  assert.equal(s.ai.costUsdMicro, 0);
  assert.ok(s.flags.some((f) => f.code === "AI_INCOMPLETE_RECORDS"));
});

test("AI: إعادة المحاولة المفوتَرة تُحتسب تكلفةً ولا تُعدّ رسالة إضافية", () => {
  const s = summarizeMonth(baseInput({ ai: { usage: [usage({ count: 10, completeCostMicro: 2_000_000 }), usage({ feature: "chat-retry", count: 1, completeCostMicro: 500_000 })], invoices: [] } }));
  assert.equal(s.ai.provisionalUsdMicro, 2_500_000);
});

test("AI: تكلفة بالدولار بلا سعر صرف → null للريال، ونتيجة التشغيل null لا رقماً مضلِّلاً", () => {
  const s = summarizeMonth(baseInput({ subscriptions: { ...baseInput().subscriptions, paidInMonth: [invoice("i1", 9900)] }, ai: { usage: [usage()], invoices: [] } }));
  assert.equal(s.ai.costSarMinor, null);
  assert.equal(s.result.operatingResultCashMinor, null);
  assert.ok(s.flags.some((f) => f.code === "AI_FX_MISSING" && f.severity === "BLOCKING"));
});

test("AI: استخدام بلا متجر يظهر ضمن «بدون متجر» (استخدام المنصة)، وتكلفة كل متجر وباقة", () => {
  const s = summarizeMonth(baseInput({ ai: { usage: [usage({ storeId: "st1" }), usage({ storeId: "st2", plan: "PRO" }), usage({ storeId: null, plan: null })], invoices: [] } }));
  assert.equal(s.ai.byStore.length, 3);
  assert.ok(s.ai.byStore.some((x) => x.storeId === null));
  assert.ok(s.ai.byPlan.some((x) => x.plan === "غير محدد"));
});

test("مصروفات: الملغاة خارج الحساب، وغير المدفوع لا يدخل النقد، والتأسيس منفصل عن التشغيل", () => {
  const s = summarizeMonth(baseInput({ expenses: [
    expense("e1", 100000, { kind: "FIXED" }),
    expense("e2", 50000, { kind: "VARIABLE", status: "UNPAID", paidAt: null }),
    expense("e3", 900000, { category: "ESTABLISHMENT" }),
    expense("e4", 70000, { voided: true }),
  ] }));
  assert.equal(s.expenses.operatingIncurredMinor, 150000);
  assert.equal(s.expenses.operatingPaidMinor, 100000);
  assert.equal(s.expenses.operatingUnpaidMinor, 50000);
  assert.equal(s.expenses.fixedOperatingMinor, 100000);
  assert.equal(s.expenses.variableOperatingMinor, 50000);
  assert.equal(s.expenses.establishmentIncurredMinor, 900000);
  assert.equal(s.expenses.establishmentPaidMinor, 900000);
});

test("نتيجة التشغيل (تحصيل) تستبعد التأسيس، وصافي التدفق يشمله، وكلاهما يميّزان المستحق غير المحصّل", () => {
  const s = summarizeMonth(baseInput({
    subscriptions: { ...baseInput().subscriptions, paidInMonth: [invoice("i1", 100000)] },
    expenses: [expense("e1", 30000), expense("e2", 500000, { category: "ESTABLISHMENT" })],
    shipments: [ext({ deliveredAt: d("2026-11-02T09:00:00Z") })],
  }));
  assert.equal(s.result.cashReceiptsMinor, 100000);          // العمولة 3 ر.س مستحقة وليست محصّلة
  assert.equal(s.result.operatingResultCashMinor, 70000);
  assert.equal(s.result.netCashFlowMinor, 100000 - 30000 - 500000);
  assert.equal(s.result.accruedDuesMinor, 300);
});

test("حدود الشهر بتوقيت الرياض للمصروفات", () => {
  const onEdge = expense("e1", 1000, { expenseDate: d("2026-10-31T21:00:00Z"), paidAt: d("2026-10-31T21:00:00Z") }); // 1 نوفمبر الرياض
  const before = expense("e2", 2000, { expenseDate: d("2026-10-31T20:59:59Z"), paidAt: d("2026-10-31T20:59:59Z") });
  const s = summarizeMonth(baseInput({ expenses: [onEdge, before] }));
  assert.equal(s.expenses.operatingIncurredMinor, 1000);
});
