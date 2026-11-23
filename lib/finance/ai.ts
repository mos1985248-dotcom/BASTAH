// lib/finance/ai.ts — تكلفة الذكاء الاصطناعي. مصدر واحد فقط في ملخص التشغيل:
//   الفاتورة الموثقة للشهر (إن وُجدت) وإلا المحسوبة مؤقتاً من AIUsage (موسومة). لا يُجمع المصدران أبداً.
//   شحن الرصيد المسبق تدفق نقدي فقط. الدولار يبقى دولاراً؛ التحويل بسعر صرف موثَّق وإلا null (لا تقدير).
import { sum, usdMicroToSarMinor } from "./money";
import { inMonth, monthRangeUtc, type MonthKey } from "./riyadh";
import type { AiIn, AiInvoiceIn, Flag, MonthlySummary } from "./types";

function weightedFx(invoices: AiInvoiceIn[]): number | null {
  const withFx = invoices.filter((i) => i.fxSarPerUsd !== null && i.amountUsdMicro > 0);
  if (withFx.length === 0 || withFx.length !== invoices.length) return null;
  const total = sum(withFx.map((i) => i.amountUsdMicro));
  return sum(withFx.map((i) => (i.fxSarPerUsd as number) * i.amountUsdMicro)) / total;
}

export function computeAi(ai: AiIn, month: MonthKey, netSubscriptionsMinor: number): { out: MonthlySummary["ai"]; flags: Flag[] } {
  const flags: Flag[] = [];
  const { start, end } = monthRangeUtc(month);

  const provisional = sum(ai.usage.map((g) => g.completeCostMicro + g.legacyEstimateMicro));
  const incompleteCount = sum(ai.usage.map((g) => g.incompleteCount));
  const legacyCount = sum(ai.usage.map((g) => g.legacyCount));

  // فواتير الاستهلاك الموثقة المحصورة كلياً داخل الشهر
  const usageInvoices = ai.invoices.filter((i) => i.kind === "USAGE_INVOICE");
  const contained = usageInvoices.filter((i) => i.periodStart && i.periodEnd && i.periodStart >= start && i.periodEnd <= end);
  const overlapping = usageInvoices.filter((i) => i.periodStart && i.periodEnd && i.periodEnd > start && i.periodStart < end && !contained.includes(i));
  const documented = contained.length ? sum(contained.map((i) => i.amountUsdMicro)) : null;
  if (overlapping.length) flags.push({ code: "AI_INVOICE_PARTIAL_OVERLAP", severity: "INFO", count: overlapping.length, message: "فواتير مزوّد تتجاوز حدود الشهر؛ لم تُستعمل مصدراً للشهر (يُستعمل الحساب المؤقت)." });

  const source: MonthlySummary["ai"]["source"] = documented !== null ? "DOCUMENTED" : provisional > 0 || incompleteCount > 0 ? "PROVISIONAL" : "NONE";
  const costUsdMicro = documented ?? provisional;

  // سعر الصرف: من الفواتير الموثقة المستعملة، وإلا آخر سعر موثَّق مسجَّل خلال الشهر
  let fx = documented !== null ? weightedFx(contained) : null;
  if (fx === null) {
    const dated = ai.invoices.filter((i) => i.fxSarPerUsd !== null && i.fxDate && inMonth(i.fxDate, month)).sort((a, b) => (b.fxDate as Date).getTime() - (a.fxDate as Date).getTime());
    fx = dated[0]?.fxSarPerUsd ?? null;
  }
  const costSar = usdMicroToSarMinor(costUsdMicro, fx);

  // التدفق النقدي: شحن مسبق + فواتير استهلاك دُفعت خلال الشهر
  const topups = ai.invoices.filter((i) => i.kind === "PREPAID_TOPUP" && inMonth(i.paidAt, month));
  const paidUsage = usageInvoices.filter((i) => inMonth(i.paidAt, month));
  const cashOut = [...topups, ...paidUsage];
  const cashUsd = sum(cashOut.map((i) => i.amountUsdMicro));
  const cashSarParts = cashOut.map((i) => usdMicroToSarMinor(i.amountUsdMicro, i.fxSarPerUsd));
  const cashSar = cashSarParts.every((x) => x !== null) ? sum(cashSarParts as number[]) : null;
  const topUsd = sum(topups.map((i) => i.amountUsdMicro));
  const topParts = topups.map((i) => usdMicroToSarMinor(i.amountUsdMicro, i.fxSarPerUsd));

  const group = <K extends string>(keyOf: (g: AiIn["usage"][number]) => K) => {
    const m = new Map<K, number>();
    for (const g of ai.usage) m.set(keyOf(g), (m.get(keyOf(g)) ?? 0) + g.completeCostMicro + g.legacyEstimateMicro);
    return m;
  };
  const storeMap = new Map<string | null, { cost: number; count: number }>();
  for (const g of ai.usage) {
    const cur = storeMap.get(g.storeId) ?? { cost: 0, count: 0 };
    cur.cost += g.completeCostMicro + g.legacyEstimateMicro; cur.count += g.count;
    storeMap.set(g.storeId, cur);
  }

  if (incompleteCount > 0) flags.push({ code: "AI_INCOMPLETE_RECORDS", severity: "WARN", count: incompleteCount, message: "سجلات ذكاء اصطناعي ناقصة السعر أو الاستخدام: «غير مكتملة» ولا تُحسب صفراً ولا تقديراً." });
  if (legacyCount > 0) flags.push({ code: "AI_LEGACY_ESTIMATES", severity: "INFO", count: legacyCount, message: "سجلات قديمة بتقدير تقريبي (بلا لقطة سعر): تُعرض مؤقتة وتحليلية فقط." });
  if (costUsdMicro > 0 && costSar === null) flags.push({ code: "AI_FX_MISSING", severity: "BLOCKING", message: "تكلفة الذكاء الاصطناعي بالدولار بلا سعر صرف موثَّق؛ لا تُحوَّل للريال ولا تدخل نتيجة التشغيل." });

  const aiByPlan = group((g) => (g.plan ?? "غير محدد") as string);
  const byFeature = group((g) => g.feature);
  return {
    flags,
    out: {
      source, costUsdMicro, costSarMinor: costSar, provisionalUsdMicro: provisional, documentedUsdMicro: documented,
      reconciliationDiffUsdMicro: documented !== null ? documented - provisional : null,
      incompleteCount, legacyCount, topupsUsdMicro: topUsd, topupsSarMinor: topParts.every((x) => x !== null) ? sum(topParts as number[]) : null,
      cashOutUsdMicro: cashUsd, cashOutSarMinor: cashSar, fxSarPerUsd: fx,
      byStore: [...storeMap.entries()].map(([storeId, v]) => ({ storeId, costUsdMicro: v.cost, count: v.count })).sort((a, b) => b.costUsdMicro - a.costUsdMicro),
      byPlan: [...aiByPlan.entries()].map(([plan, costUsdMicro]) => ({ plan, costUsdMicro })),
      byFeature: [...byFeature.entries()].map(([feature, costUsdMicro]) => ({ feature, costUsdMicro })),
      // نسبة فقط (ليست ربحاً): بقية تكاليف الخدمة ما زالت قائمة
      revenueRatio: costSar !== null && netSubscriptionsMinor > 0 ? costSar / netSubscriptionsMinor : null,
    },
  };
}
