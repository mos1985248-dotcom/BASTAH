// lib/finance/engine.ts — يجمع أقسام المركز المالي لشهر واحد. دالة نقية: نفس المدخلات = نفس المخرجات.
// الفصل المقصود: (١) المستحق لبسطة، (٢) المحصَّل فعلاً، (٣) التزامات المناديب، (٤) نتيجة التشغيل، (٥) صافي التدفق النقدي.
import { computeAi } from "./ai";
import { computeExpenses } from "./expenses";
import { sum } from "./money";
import { computeShipping, settled } from "./shipping";
import { computeSubscriptions } from "./subscriptions";
import { inMonth } from "./riyadh";
import type { MonthInput, MonthlySummary } from "./types";

export function summarizeMonth(input: MonthInput): MonthlySummary {
  const { month } = input;
  const subs = computeSubscriptions(input.subscriptions, month);
  const ship = computeShipping(input.shipments, input.settlements, month, input.failedOrReturnedInMonth, input.courierNames);
  const expenses = computeExpenses(input.expenses, month);
  const ai = computeAi(input.ai, month, subs.out.netCollectedMinor);
  const flags = [...subs.flags, ...ship.flags, ...ai.flags];

  // التحصيلات الفعلية لبسطة (من سجل التسويات فقط). النوع OTHER لا اتجاه له فلا يدخل.
  const monthSettlements = input.settlements.filter((s) => inMonth(s.settledAt, month));
  const receipts = sum((["COMMISSION_RECEIPT", "LOCAL_DELIVERY_RECEIPT", "COD_SHARE_RECEIPT"] as const).map((k) => settled(monthSettlements, k)));
  const cashReceipts = subs.out.netCollectedMinor + receipts;

  // نتيجة التشغيل (أساس التحصيل): تكلفة الذكاء الاصطناعي هنا استهلاك (مصدر واحد)، لا نقد مدفوع.
  const aiSar = ai.out.costSarMinor;
  const aiKnown = ai.out.costUsdMicro === 0 || aiSar !== null;
  const operatingResultCash = aiKnown
    ? cashReceipts - expenses.operatingPaidMinor - ship.couriers.paidMinor - (aiSar ?? 0)
    : null;
  // صافي التدفق: كل النقد الداخل − كل النقد الخارج فعلاً (شاملاً التأسيس وشحن رصيد المزوّد المسبق).
  const netCashFlow = ai.out.cashOutSarMinor !== null
    ? cashReceipts - expenses.operatingPaidMinor - expenses.establishmentPaidMinor - ship.couriers.paidMinor - ai.out.cashOutSarMinor
    : null;

  if (expenses.manualAiMinor > 0 && ai.out.costUsdMicro > 0) {
    flags.push({ code: "AI_MANUAL_AND_AUTOMATIC", severity: "INFO", message: "توجد مصروفات «ذكاء اصطناعي» يدوية مع تتبع الاستهلاك التلقائي؛ تأكد ألا تسجّل فاتورة المزوّد نفسها يدوياً أيضاً (ازدواج)." });
  }

  return {
    month, subscriptions: subs.out, external: ship.external, local: ship.local, cod: ship.cod,
    expenses, couriers: ship.couriers, ai: ai.out,
    result: {
      cashReceiptsMinor: cashReceipts, operatingResultCashMinor: operatingResultCash, establishmentPaidMinor: expenses.establishmentPaidMinor,
      netCashFlowMinor: netCashFlow,
      accruedDuesMinor: ship.external.outstandingMinor + ship.local.outstandingMinor + ship.cod.outstandingMinor,
      label: "نتيجة التشغيل على أساس التحصيل — وليست ربحاً محاسبياً على أساس الاستحقاق",
    },
    flags,
  };
}
