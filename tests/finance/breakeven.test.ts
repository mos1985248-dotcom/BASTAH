import { test } from "node:test";
import assert from "node:assert/strict";
import { breakEven } from "../../lib/finance/breakeven";
import { summarizeMonth } from "../../lib/finance/engine";
import type { MonthInput } from "../../lib/finance/types";
import { baseInput, expense, ext, invoice, local } from "./helpers";

const subsIn = (paid: ReturnType<typeof invoice>[]) => ({ ...baseInput().subscriptions, paidInMonth: paid, vatMode: "INCLUSIVE" as const });
const run = (over: Partial<MonthInput>) => breakEven(summarizeMonth(baseInput(over)));

test("مثال الوثيقة: مصروفات ثابتة 3000 ومساهمة 2100 → تغطية 70% ومتبقٍ 900", () => {
  const be = run({
    subscriptions: subsIn(Array.from({ length: 21 }, (_, i) => invoice(`i${i}`, 10000))), // 21 × 100 = 2100
    expenses: [expense("e1", 300000, { kind: "FIXED" })],
  });
  assert.equal(be.contributionMinor, 210000);
  assert.equal(be.coveragePct, 70);
  assert.equal(be.remainingMinor, 90000);
  assert.equal(be.status, "BELOW");
  assert.equal(be.basis, "ACTUAL");
});

test("الحالات الثلاث: دون / عند / فوق التعادل", () => {
  const mk = (n: number) => run({ subscriptions: subsIn(Array.from({ length: n }, (_, i) => invoice(`i${i}`, 10000))), expenses: [expense("e1", 300000)] });
  assert.equal(mk(20).status, "BELOW");
  assert.equal(mk(30).status, "AT");
  assert.equal(mk(31).status, "ABOVE");
  assert.equal(mk(31).remainingMinor, 0);
});

test("مصروفات التأسيس لا تدخل نقطة التعادل التشغيلية", () => {
  const be = run({ subscriptions: subsIn([invoice("i1", 100000)]), expenses: [expense("e1", 50000), expense("e2", 9_000_000, { category: "ESTABLISHMENT" })] });
  assert.equal(be.fixedOperatingMinor, 50000);
  assert.equal(be.status, "ABOVE");
});

test("التكاليف المتغيرة تُخصم من هامش المساهمة (مرة واحدة)", () => {
  const be = run({ subscriptions: subsIn([invoice("i1", 100000)]), expenses: [expense("f", 60000, { kind: "FIXED" }), expense("v", 15000, { kind: "VARIABLE" })] });
  assert.equal(be.contributionMinor, 100000 - 15000);
});

test("هامش المساهمة غير الموجب: يعرض السبب ولا يقترح عدداً مضلِّلاً", () => {
  const be = run({ subscriptions: subsIn([invoice("i1", 10000)]), expenses: [expense("f", 100000, { kind: "FIXED" }), expense("v", 20000, { kind: "VARIABLE" })] });
  assert.equal(be.status, "NON_POSITIVE_MARGIN");
  assert.equal(be.scenarios.subscriptionsOnly.possible, false);
  assert.ok(be.reasons.some((r) => r.includes("غير موجب")));
});

test("بلا مصروفات ثابتة أو بإعداد ضريبة ناقص: بيانات غير كافية", () => {
  assert.equal(run({ subscriptions: subsIn([invoice("i1", 10000)]) }).status, "INSUFFICIENT_DATA");
  const unsetVat = run({ subscriptions: { ...baseInput().subscriptions, paidInMonth: [invoice("i1", 11500, { vatMinor: 1500 })] }, expenses: [expense("f", 1000)] });
  assert.equal(unsetVat.status, "INSUFFICIENT_DATA");
});

test("سيناريو الاشتراكات فقط: العدد المطلوب من متوسط المساهمة الفعلي لا من سعر باقة واحدة", () => {
  const paid = [invoice("a", 4900), invoice("b", 9900, { plan: "LAUNCH" })]; // متوسط 74.00
  const be = run({ subscriptions: subsIn(paid), expenses: [expense("f", 100000)] });
  const gap = be.remainingMinor!;
  assert.equal(be.scenarios.subscriptionsOnly.neededSubscriptions, Math.ceil(gap / 7400));
});

test("السيناريو المختلط: يفصل عدد الاشتراكات عن عدد الشحنات ولا يجمعهما في متوسط واحد", () => {
  const paid = [invoice("a", 4900), invoice("b", 9900, { plan: "LAUNCH" })];
  const be = run({ subscriptions: subsIn(paid), shipments: [local("c1"), local("c1")], expenses: [expense("f", 100000)] });
  const m = be.scenarios.mixed;
  assert.equal(m.possible, true);
  assert.ok((m.neededSubscriptions ?? 0) > 0 && (m.neededShipments ?? 0) > 0);
  assert.ok(m.assumptions.length >= 3);
  assert.equal(be.planMix.reduce((a, p) => a + p.sharePct, 0), 100);
});

test("المختلط بلا شحنات محلية موثقة: بيانات غير كافية بدل رقم تخميني", () => {
  const be = run({ subscriptions: subsIn([invoice("a", 4900)]), expenses: [expense("f", 100000)] });
  assert.equal(be.scenarios.mixed.possible, false);
  assert.ok(be.scenarios.mixed.reason);
});

test("الاتجاه الشهري: يقارن التغطية عبر الأشهر", () => {
  const march = summarizeMonth(baseInput({ month: { year: 2026, month: 10 }, subscriptions: subsIn([]), expenses: [expense("f", 100000, { expenseDate: new Date("2026-10-10T09:00:00Z") })] }));
  const be = breakEven(summarizeMonth(baseInput({ subscriptions: subsIn([invoice("a", 50000)]), expenses: [expense("f", 100000)] })), [march]);
  assert.equal(be.trend.length, 2);
  assert.equal(be.trend[1].coveragePct, 50);
});

test("عمولة الشحن الخارجي تدخل المساهمة، وحصة الناقل ومستحقات المناديب لا تدخل الأرباح", () => {
  const be = run({ subscriptions: subsIn([]), shipments: [ext(), ext()], expenses: [expense("f", 10000)] });
  assert.equal(be.parts.externalMinor, 600);
  assert.equal(be.contributionMinor, 600);
});
