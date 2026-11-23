// lib/finance/subscriptions.ts — إيراد الاشتراكات من الفواتير المدفوعة فعلاً (PAID + paidAt)، مع الاستردادات الموثقة.
import { sum } from "./money";
import { inMonth, type MonthKey } from "./riyadh";
import type { Flag, SubscriptionsIn, SubscriptionsOut } from "./types";

export function computeSubscriptions(input: SubscriptionsIn, month: MonthKey): { out: SubscriptionsOut; flags: Flag[] } {
  const flags: Flag[] = [];

  // منع احتساب الفاتورة نفسها مرتين (إعادة إرسال webhook أو تكرار صف)
  const seen = new Set<string>();
  const paid = input.paidInMonth.filter((i) => {
    if (i.amountMinor <= 0 || !inMonth(i.paidAt, month) || seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });

  const gross = sum(paid.map((i) => i.amountMinor));
  const vat = sum(paid.map((i) => i.vatMinor ?? 0));

  // الضريبة: لا نفترض الشمول. المبلغ المخصوم من البطاقة = amount دائماً (مؤكَّد)، وتقسيمه يتبع الإعداد.
  let preVat: number | null;
  if (vat === 0) preVat = gross;
  else if (input.vatMode === "INCLUSIVE") preVat = gross - vat;
  else if (input.vatMode === "EXCLUDED_FROM_CHARGE") preVat = gross;
  else {
    preVat = null;
    flags.push({ code: "VAT_MODE_UNSET", severity: "WARN", message: "إعداد الضريبة غير محدد: لا يمكن فصل الإيراد قبل الضريبة عن الضريبة المسجّلة." });
  }

  const refundSeen = new Set<string>();
  const refunds = sum(
    input.refunds
      .filter((r) => inMonth(r.refundedAt, month) && !refundSeen.has(r.id) && refundSeen.add(r.id))
      .map((r) => (r.isReversal ? -r.amountMinor : r.amountMinor)),
  );

  const yearlyUnique = new Map(input.yearlyInCoverage.filter((i) => i.amountMinor > 0).map((i) => [i.id, i]));
  const yearlyCash = sum(paid.filter((i) => i.cycle === "yearly").map((i) => i.amountMinor));
  const monthlyRecurring = sum(paid.filter((i) => i.cycle !== "yearly").map((i) => i.amountMinor));
  const yearlySpread = sum([...yearlyUnique.values()].map((i) => Math.round(i.amountMinor / 12)));

  const planMap = new Map<string, { count: number; grossMinor: number }>();
  for (const i of paid) {
    const row = planMap.get(i.plan) ?? { count: 0, grossMinor: 0 };
    row.count += 1;
    row.grossMinor += i.amountMinor;
    planMap.set(i.plan, row);
  }

  if (input.statusRefundedWithoutEvent > 0) {
    flags.push({
      code: "REFUNDED_STATUS_WITHOUT_EVENT", severity: "WARN", count: input.statusRefundedWithoutEvent,
      message: "فواتير حالتها «مُستردّة» بلا حدث استرداد موثّق؛ لم تُخصم من التدفق النقدي. سجّل الاسترداد لتظهر في شهره.",
    });
  }

  return {
    flags,
    out: {
      paidCount: paid.length, paidGrossMinor: gross, vatRecordedMinor: vat, preVatMinor: preVat,
      refundsMinor: refunds, netCollectedMinor: gross - refunds,
      yearlyCashMinor: yearlyCash,
      // تقدير: الشهرية المدفوعة هذا الشهر + ثُمن اثني عشر لكل سنوية دُفعت خلال آخر 12 شهراً
      recurringMonthlyEstimateMinor: monthlyRecurring + yearlySpread,
      trialCount: input.trialCount, freePlanCount: input.freePlanCount,
      statusRefundedWithoutEvent: input.statusRefundedWithoutEvent, vatMode: input.vatMode,
      byPlan: [...planMap.entries()].map(([plan, v]) => ({ plan, ...v })).sort((a, b) => b.grossMinor - a.grossMinor),
    },
  };
}
