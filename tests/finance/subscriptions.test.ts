import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeMonth } from "../../lib/finance/engine";
import { baseInput, d, IN_NOV, invoice } from "./helpers";

const subs = (over: object) => ({ ...baseInput().subscriptions, ...over });

test("اشتراك مدفوع يُحتسب بقيمة الفاتورة التاريخية لا بسعر ثابت", () => {
  const s = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [invoice("i1", 4900), invoice("i2", 9900, { plan: "LAUNCH" })] }) }));
  assert.equal(s.subscriptions.paidGrossMinor, 14800);
  assert.equal(s.subscriptions.paidCount, 2);
  assert.deepEqual(s.subscriptions.byPlan.map((p) => p.plan).sort(), ["GROWTH", "LAUNCH"]);
});

test("فاتورة مجانية/تجريبية بمبلغ 0 لا تدخل الإيراد، وتُعرض أعدادها منفصلة", () => {
  const s = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [invoice("f1", 0)], trialCount: 3, freePlanCount: 5 }) }));
  assert.equal(s.subscriptions.paidGrossMinor, 0);
  assert.equal(s.subscriptions.trialCount, 3);
  assert.equal(s.subscriptions.freePlanCount, 5);
});

test("webhook مكرر: الفاتورة نفسها تُحتسب مرة واحدة", () => {
  const dup = invoice("i1", 4900);
  const s = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [dup, { ...dup }, { ...dup }] }) }));
  assert.equal(s.subscriptions.paidGrossMinor, 4900);
  assert.equal(s.subscriptions.paidCount, 1);
});

test("فاتورة دُفعت خارج الشهر (حدّ توقيت الرياض) لا تدخل", () => {
  // 2026-10-31T21:00Z = 2026-11-01 00:00 الرياض → نوفمبر؛ 2026-10-31T20:59:59Z → أكتوبر
  const inNov = invoice("a", 4900, { paidAt: d("2026-10-31T21:00:00Z") });
  const inOct = invoice("b", 9900, { paidAt: d("2026-10-31T20:59:59Z") });
  const s = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [inNov, inOct] }) }));
  assert.equal(s.subscriptions.paidGrossMinor, 4900);
});

test("الضريبة: بلا إعداد لا نفترض الشمول، ومع الإعداد يُفصل الإيراد", () => {
  const withVat = [invoice("v1", 11500, { vatMinor: 1500 })];
  const unset = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: withVat }) }));
  assert.equal(unset.subscriptions.preVatMinor, null);
  assert.ok(unset.flags.some((f) => f.code === "VAT_MODE_UNSET"));
  const inc = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: withVat, vatMode: "INCLUSIVE" }) }));
  assert.equal(inc.subscriptions.preVatMinor, 10000);
  assert.equal(inc.subscriptions.vatRecordedMinor, 1500);
  const noVat = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [invoice("n1", 4900)] }) }));
  assert.equal(noVat.subscriptions.preVatMinor, 4900);
});

test("استرداد جزئي ثم كامل يظهر في شهر حدوثه وبصافي المحصل", () => {
  const paid = invoice("i1", 9900, { paidAt: d("2026-10-05T09:00:00Z") });
  const refunds = [
    { id: "r1", invoiceId: "i1", amountMinor: 3000, refundedAt: IN_NOV, isReversal: false },
    { id: "r2", invoiceId: "i1", amountMinor: 6900, refundedAt: d("2026-12-02T09:00:00Z"), isReversal: false },
  ];
  const nov = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [invoice("i2", 4900)], refunds }) }));
  assert.equal(nov.subscriptions.refundsMinor, 3000);
  assert.equal(nov.subscriptions.netCollectedMinor, 4900 - 3000);
  // الاسترداد الثاني يظهر في ديسمبر فقط، وبشهر حدوثه لا بشهر الدفع الأصلي (أكتوبر)
  const dec = summarizeMonth(baseInput({ month: { year: 2026, month: 12 }, subscriptions: subs({ refunds }) }));
  assert.equal(dec.subscriptions.refundsMinor, 6900);
  assert.equal(paid.amountMinor, 3000 + 6900);
});

test("عكس استرداد خاطئ يُنقص مجموع الاستردادات", () => {
  const refunds = [
    { id: "r1", invoiceId: "i1", amountMinor: 3000, refundedAt: IN_NOV, isReversal: false },
    { id: "r1x", invoiceId: "i1", amountMinor: 3000, refundedAt: IN_NOV, isReversal: true },
  ];
  assert.equal(summarizeMonth(baseInput({ subscriptions: subs({ refunds }) })).subscriptions.refundsMinor, 0);
});

test("حالة REFUNDED بلا حدث موثق لا تخصم نقداً وتُنبَّه", () => {
  const s = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [invoice("i1", 4900)], statusRefundedWithoutEvent: 2 }) }));
  assert.equal(s.subscriptions.refundsMinor, 0);
  assert.ok(s.flags.some((f) => f.code === "REFUNDED_STATUS_WITHOUT_EVENT"));
});

test("السنوي: كامل التحصيل نقداً في شهر الدفع، والمتكرر الشهري تقدير = المبلغ ÷ 12", () => {
  const yearly = invoice("y1", 119880, { cycle: "yearly" });
  const s = summarizeMonth(baseInput({ subscriptions: subs({ paidInMonth: [yearly, invoice("m1", 4900)], yearlyInCoverage: [yearly] }) }));
  assert.equal(s.subscriptions.yearlyCashMinor, 119880);
  assert.equal(s.subscriptions.paidGrossMinor, 119880 + 4900);
  assert.equal(s.subscriptions.recurringMonthlyEstimateMinor, 4900 + 9990);
});
