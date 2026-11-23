// lib/finance/build.ts — يبني مدخلات المحرك لشهر معيّن من بيانات خام محمَّلة مرة واحدة (دالة نقية، بلا قاعدة).
import { inMonth, monthRangeUtc, riyadhMonthOf, sameMonth, shiftMonth, type MonthKey } from "./riyadh";
import type { AiInvoiceIn, AiUsageGroupIn, ExpenseIn, InvoiceIn, MonthInput, RefundIn, SettlementIn, ShipmentIn, VatMode } from "./types";

export interface AiRowIn {
  createdAt: Date; storeId: string | null; feature: string; plan: string | null; planIsCurrentFallback: boolean;
  status: "COMPLETE" | "INCOMPLETE" | "LEGACY"; costMicro: number; estimateMicro: number;
}

export interface RawFinanceData {
  vatMode: VatMode;
  invoicesPaid: InvoiceIn[];                  // كل الفواتير المدفوعة في النطاق (+12 شهراً سابقة للسنوية)
  refunds: RefundIn[];
  statusRefundedWithoutEvent: number;
  trialCount: number;
  freePlanCount: number;
  shipments: ShipmentIn[];                    // كل المسلَّمة حتى نهاية آخر شهر
  failedOrReturnedDates: Date[];
  settlements: SettlementIn[];
  expenses: ExpenseIn[];
  aiRows: AiRowIn[];
  aiInvoices: AiInvoiceIn[];
  courierNames: Record<string, string>;
}

function aiGroups(rows: AiRowIn[], month: MonthKey): AiUsageGroupIn[] {
  const groups = new Map<string, AiUsageGroupIn>();
  for (const r of rows.filter((x) => inMonth(x.createdAt, month))) {
    const key = `${r.storeId ?? "∅"}|${r.feature}|${r.plan ?? "∅"}|${r.planIsCurrentFallback}`;
    const g = groups.get(key) ?? { storeId: r.storeId, feature: r.feature, plan: r.plan, planIsCurrentFallback: r.planIsCurrentFallback, count: 0, completeCostMicro: 0, incompleteCount: 0, legacyCount: 0, legacyEstimateMicro: 0 };
    g.count += 1;
    if (r.status === "COMPLETE") g.completeCostMicro += r.costMicro;
    else if (r.status === "INCOMPLETE") g.incompleteCount += 1;
    else { g.legacyCount += 1; g.legacyEstimateMicro += r.estimateMicro; }
    groups.set(key, g);
  }
  return [...groups.values()];
}

export function buildMonthInput(raw: RawFinanceData, month: MonthKey): MonthInput {
  const { end } = monthRangeUtc(month);
  const coverageStart = monthRangeUtc(shiftMonth(month, -11)).start;
  return {
    month,
    subscriptions: {
      vatMode: raw.vatMode,
      paidInMonth: raw.invoicesPaid.filter((i) => inMonth(i.paidAt, month)),
      yearlyInCoverage: raw.invoicesPaid.filter((i) => i.cycle === "yearly" && i.paidAt >= coverageStart && i.paidAt < end),
      refunds: raw.refunds.filter((r) => r.refundedAt < end),
      statusRefundedWithoutEvent: raw.statusRefundedWithoutEvent,
      trialCount: raw.trialCount, freePlanCount: raw.freePlanCount,
    },
    shipments: raw.shipments.filter((s) => s.deliveredAt !== null && s.deliveredAt < end),
    failedOrReturnedInMonth: raw.failedOrReturnedDates.filter((x) => sameMonth(riyadhMonthOf(x), month)).length,
    settlements: raw.settlements.filter((s) => s.settledAt < end),
    expenses: raw.expenses,
    ai: { usage: aiGroups(raw.aiRows, month), invoices: raw.aiInvoices },
    courierNames: raw.courierNames,
  };
}
