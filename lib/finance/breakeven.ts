// lib/finance/breakeven.ts — نقطة التعادل التشغيلية الشهرية.
//   التغطية = هامش المساهمة ÷ المصروفات التشغيلية الثابتة.
//   هامش المساهمة = إيراد الاشتراكات قبل الضريبة (بعد الاستردادات) + عمولة الشحن الخارجي المستحقة + هامش الشحن المحلي الموثَّق
//                  + صافي حصة COD المكتملة − التكاليف المتغيرة (مصروفات متغيرة + تكلفة الذكاء الاصطناعي).
//   تُستبعد مصروفات التأسيس. لا تُحتسب مستحقات المناديب ولا حصص الناقل أرباحاً. الأرقام الناقصة تُعرض سبباً لا رقماً مضلِّلاً.
import { monthLabel } from "./riyadh";
import type { MonthlySummary } from "./types";

export type BreakEvenStatus = "BELOW" | "AT" | "ABOVE" | "INSUFFICIENT_DATA" | "NON_POSITIVE_MARGIN";

export interface Contribution {
  contributionMinor: number | null;
  parts: { subscriptionsMinor: number | null; externalMinor: number; localMarginMinor: number; codNetMinor: number; variableExpensesMinor: number; aiCostMinor: number | null };
  incompleteReasons: string[];
  blockingReasons: string[];
}

export function contributionOf(s: MonthlySummary): Contribution {
  const incompleteReasons: string[] = [];
  const blockingReasons: string[] = [];
  const subscriptions = s.subscriptions.preVatMinor === null ? null : s.subscriptions.preVatMinor - s.subscriptions.refundsMinor;
  if (subscriptions === null) blockingReasons.push("إعداد الضريبة غير محدد لفواتير الاشتراكات");
  const ai = s.ai.costUsdMicro === 0 ? 0 : s.ai.costSarMinor;
  if (ai === null) blockingReasons.push("تكلفة الذكاء الاصطناعي بلا سعر صرف موثَّق");
  if (s.local.undocumentedCount > 0) incompleteReasons.push(`${s.local.undocumentedCount} شحنة محلية غير موثقة القيم`);
  if (s.cod.incompleteCount > 0) incompleteReasons.push(`${s.cod.incompleteCount} طلب COD بإعداد تكلفة ناقص`);
  if (s.external.undocumentedCount > 0) incompleteReasons.push(`${s.external.undocumentedCount} شحنة خارجية بلا عمولة محفوظة`);
  if (s.ai.incompleteCount > 0) incompleteReasons.push(`${s.ai.incompleteCount} سجل ذكاء اصطناعي غير مكتمل`);

  const parts = {
    subscriptionsMinor: subscriptions, externalMinor: s.external.accruedMinor, localMarginMinor: s.local.marginMinor,
    codNetMinor: s.cod.netShareMinor, variableExpensesMinor: s.expenses.variableOperatingMinor, aiCostMinor: ai,
  };
  const contribution = subscriptions === null || ai === null
    ? null
    : subscriptions + parts.externalMinor + parts.localMarginMinor + parts.codNetMinor - parts.variableExpensesMinor - ai;
  return { contributionMinor: contribution, parts, incompleteReasons, blockingReasons };
}

export interface ScenarioOut {
  possible: boolean;
  neededSubscriptions: number | null;
  neededShipments: number | null;
  assumptions: string[];
  reason?: string;
}

export interface BreakEvenOut {
  status: BreakEvenStatus;
  basis: "ACTUAL" | "ESTIMATED";
  fixedOperatingMinor: number;
  contributionMinor: number | null;
  coveragePct: number | null;
  remainingMinor: number | null;
  reasons: string[];
  parts: Contribution["parts"];
  scenarios: { subscriptionsOnly: ScenarioOut; mixed: ScenarioOut };
  planMix: { plan: string; sharePct: number }[];
  trend: { month: string; coveragePct: number | null; contributionMinor: number | null; fixedMinor: number }[];
}

const AT_TOLERANCE_MINOR = 100; // ±1 ريال

export function coverageOf(s: MonthlySummary): { coveragePct: number | null; contributionMinor: number | null; fixedMinor: number } {
  const c = contributionOf(s);
  const fixed = s.expenses.fixedOperatingMinor;
  return { contributionMinor: c.contributionMinor, fixedMinor: fixed, coveragePct: c.contributionMinor === null || fixed <= 0 ? null : Math.round((c.contributionMinor / fixed) * 1000) / 10 };
}

export interface BreakEvenOptions { shipmentGapSharePct?: number }

export function breakEven(current: MonthlySummary, history: MonthlySummary[] = [], options: BreakEvenOptions = {}): BreakEvenOut {
  const c = contributionOf(current);
  const fixed = current.expenses.fixedOperatingMinor;
  const reasons: string[] = [...c.blockingReasons, ...c.incompleteReasons];
  const share = Math.min(100, Math.max(0, options.shipmentGapSharePct ?? 50)) / 100;

  let status: BreakEvenStatus;
  if (c.contributionMinor === null) status = "INSUFFICIENT_DATA";
  else if (fixed <= 0) { status = "INSUFFICIENT_DATA"; reasons.push("لا توجد مصروفات تشغيلية ثابتة مسجَّلة لهذا الشهر"); }
  else if (c.contributionMinor <= 0) { status = "NON_POSITIVE_MARGIN"; reasons.push("هامش المساهمة غير موجب، فلا يوجد عدد إضافي يغطي التكاليف"); }
  else if (Math.abs(c.contributionMinor - fixed) <= AT_TOLERANCE_MINOR) status = "AT";
  else status = c.contributionMinor > fixed ? "ABOVE" : "BELOW";

  const gap = c.contributionMinor !== null && fixed > 0 ? Math.max(0, fixed - c.contributionMinor) : null;
  const coveragePct = c.contributionMinor !== null && fixed > 0 ? Math.round((c.contributionMinor / fixed) * 1000) / 10 : null;

  const paid = current.subscriptions.paidCount;
  const avgSub = paid > 0 && c.parts.subscriptionsMinor !== null && c.parts.aiCostMinor !== null ? (c.parts.subscriptionsMinor - c.parts.aiCostMinor) / paid : null;
  const documentedShipments = current.local.eligibleCount - current.local.undocumentedCount;
  const avgShipment = documentedShipments > 0 ? current.local.marginMinor / documentedShipments : null;

  const noScenario = (reason: string): ScenarioOut => ({ possible: false, neededSubscriptions: null, neededShipments: null, assumptions: [], reason });
  let subscriptionsOnly: ScenarioOut;
  let mixed: ScenarioOut;
  if (gap === null || status === "INSUFFICIENT_DATA" || status === "NON_POSITIVE_MARGIN") {
    // هامش غير موجب أو بيانات ناقصة: نعرض السبب ولا نقترح عدداً مضلِّلاً
    subscriptionsOnly = mixed = noScenario(status === "NON_POSITIVE_MARGIN" ? "هامش المساهمة غير موجب" : "بيانات غير كافية");
  } else if (gap === 0) {
    subscriptionsOnly = mixed = { possible: true, neededSubscriptions: 0, neededShipments: 0, assumptions: [] };
  } else {
    subscriptionsOnly = avgSub === null || avgSub <= 0
      ? noScenario(avgSub === null ? "بيانات غير كافية: لا اشتراكات مدفوعة لحساب متوسط المساهمة" : "متوسط مساهمة الاشتراك غير موجب")
      : { possible: true, neededSubscriptions: Math.ceil(gap / avgSub), neededShipments: null, assumptions: [`متوسط صافي مساهمة الاشتراك الفعلي ${(avgSub / 100).toFixed(2)} ر.س (من ${paid} اشتراكاً مدفوعاً هذا الشهر)`] };
    if (avgSub === null || avgSub <= 0) mixed = noScenario("بيانات الاشتراكات غير كافية للسيناريو المختلط");
    else if (avgShipment === null || avgShipment <= 0) mixed = noScenario("بيانات هامش الشحن المحلي الموثق غير كافية للسيناريو المختلط");
    else mixed = {
      possible: true,
      neededSubscriptions: Math.ceil((gap * (1 - share)) / avgSub),
      neededShipments: Math.ceil((gap * share) / avgShipment),
      assumptions: [
        `افتراض قابل للتعديل: ${Math.round(share * 100)}% من الفجوة تُغطّى بهامش الشحن المحلي و${Math.round((1 - share) * 100)}% بالاشتراكات`,
        `متوسط هامش الشحنة الموثقة ${(avgShipment / 100).toFixed(2)} ر.س (من ${documentedShipments} شحنة)`,
        "مزيج الباقات المفترض = المزيج الفعلي لهذا الشهر (انظر planMix)",
      ],
    };
  }

  const totalPaid = current.subscriptions.byPlan.reduce((a, p) => a + p.count, 0);
  return {
    status, basis: c.blockingReasons.length || c.incompleteReasons.length ? "ESTIMATED" : "ACTUAL",
    fixedOperatingMinor: fixed, contributionMinor: c.contributionMinor, coveragePct, remainingMinor: gap, reasons, parts: c.parts,
    scenarios: { subscriptionsOnly, mixed },
    planMix: totalPaid ? current.subscriptions.byPlan.map((p) => ({ plan: p.plan, sharePct: Math.round((p.count / totalPaid) * 1000) / 10 })) : [],
    trend: [...history, current].map((s) => ({ month: monthLabel(s.month), ...(({ coveragePct: cp, contributionMinor: cm, fixedMinor: fm }) => ({ coveragePct: cp, contributionMinor: cm, fixedMinor: fm }))(coverageOf(s)) })),
  };
}
