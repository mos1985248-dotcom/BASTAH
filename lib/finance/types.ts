// lib/finance/types.ts — مدخلات ومخرجات المحرك المالي (بيانات عادية بلا Prisma، فيمكن اختبارها دون قاعدة).
// كل المبالغ بالهللات (أعداد صحيحة) ما لم يُذكر خلاف ذلك.
import type { MonthKey } from "./riyadh";

export type VatMode = "UNSET" | "INCLUSIVE" | "EXCLUDED_FROM_CHARGE";
export type SettlementKind = "COURIER_PAYOUT" | "COMMISSION_RECEIPT" | "LOCAL_DELIVERY_RECEIPT" | "COD_SHARE_RECEIPT" | "OTHER";

export interface Flag {
  code: string;
  severity: "INFO" | "WARN" | "BLOCKING";
  message: string;
  count?: number;
}

// ── المدخلات ──
export interface InvoiceIn { id: string; plan: string; cycle: string; amountMinor: number; vatMinor: number | null; paidAt: Date; storeId?: string | null }
export interface RefundIn { id: string; invoiceId: string; amountMinor: number; refundedAt: Date; isReversal: boolean }

export interface SubscriptionsIn {
  vatMode: VatMode;
  paidInMonth: InvoiceIn[];
  yearlyInCoverage: InvoiceIn[];       // سنوية دُفعت خلال آخر 12 شهراً (للتقدير المتكرر)
  refunds: RefundIn[];                  // كل الاستردادات (يُفلتر الشهر داخلياً)
  statusRefundedWithoutEvent: number;   // فواتير بحالة REFUNDED بلا حدث استرداد موثق
  trialCount: number;
  freePlanCount: number;
}

export interface ShipmentIn {
  id: string; orderId: string; storeId: string;
  deliveredAt: Date | null;
  status: string;                       // DELIVERED | FAILED | RETURNED | ...
  orderStatus: string;                  // CANCELLED/REFUNDED تُستبعد
  courierId: string | null;
  carrierKey: string | null;
  basitaFeeMinor: number | null;        // لقطة ShippingRate.basitaFee (شحن خارجي)
  assignment: { wageMinor: number | null; deliveryFeeMinor: number | null; directCostMinor: number | null } | null;
  // لتقدير الشحنات غير الموثقة بالقيم الحالية (يُعرض منفصلاً ولا يدخل المجاميع)
  orderShippingCostMinor: number;
  courierCurrentWageMinor: number | null;
  paymentMethod: string;
  codFeeMinor: number;
  codCarrierShareMinor: number | null;  // لقطة وقت الطلب؛ null = إعداد التكلفة ناقص
}

export interface SettlementIn { id: string; kind: SettlementKind; partyType: string; partyRef: string; amountMinor: number; settledAt: Date; isReversal: boolean }
export interface ExpenseIn {
  id: string; category: "ESTABLISHMENT" | "OPERATIONS" | "AI" | "SALARIES"; kind: "FIXED" | "VARIABLE";
  status: "PAID" | "UNPAID"; amountMinor: number; vatMinor: number | null; expenseDate: Date; paidAt: Date | null; voided: boolean;
}

export interface AiUsageGroupIn { storeId: string | null; feature: string; plan: string | null; planIsCurrentFallback: boolean; count: number; completeCostMicro: number; incompleteCount: number; legacyCount: number; legacyEstimateMicro: number }
export interface AiInvoiceIn { id: string; provider: string; kind: "USAGE_INVOICE" | "PREPAID_TOPUP"; periodStart: Date | null; periodEnd: Date | null; amountUsdMicro: number; fxSarPerUsd: number | null; fxDate: Date | null; paidAt: Date | null }
export interface AiIn { usage: AiUsageGroupIn[]; invoices: AiInvoiceIn[] }

export interface MonthInput {
  month: MonthKey;
  subscriptions: SubscriptionsIn;
  shipments: ShipmentIn[];              // كل الشحنات المسلَّمة حتى نهاية الشهر (للأرصدة التراكمية)
  failedOrReturnedInMonth: number;
  settlements: SettlementIn[];          // كلها حتى نهاية الشهر
  expenses: ExpenseIn[];
  ai: AiIn;
  courierNames: Record<string, string>;
}

// ── المخرجات ──
export interface SubscriptionsOut {
  paidCount: number; paidGrossMinor: number; vatRecordedMinor: number; preVatMinor: number | null;
  refundsMinor: number; netCollectedMinor: number;
  yearlyCashMinor: number; recurringMonthlyEstimateMinor: number;
  trialCount: number; freePlanCount: number; statusRefundedWithoutEvent: number; vatMode: VatMode;
  byPlan: { plan: string; count: number; grossMinor: number }[];
}
export interface DueLine { accruedMinor: number; receivedMinor: number; outstandingMinor: number; eligibleCount: number; undocumentedCount: number }
export interface CourierLine { courierId: string; name: string; deliveredCount: number; undocumentedCount: number; accruedMinor: number; paidMinor: number; balanceMinor: number }

export interface MonthlySummary {
  month: MonthKey;
  subscriptions: SubscriptionsOut;
  external: DueLine & { passThroughNote: string };
  local: DueLine & { deliveryFeeMinor: number; courierWagesMinor: number; directCostMinor: number; marginMinor: number; estimatedAtCurrentRates: { count: number; marginMinor: number }; failedOrReturned: number };
  cod: { eligibleCount: number; customerFeesGrossMinor: number; carrierSharesMinor: number; netShareMinor: number; incompleteCount: number; receivedMinor: number; outstandingMinor: number };
  expenses: { operatingIncurredMinor: number; operatingPaidMinor: number; operatingUnpaidMinor: number; fixedOperatingMinor: number; variableOperatingMinor: number; establishmentIncurredMinor: number; establishmentPaidMinor: number; manualAiMinor: number; byCategory: Record<string, number> };
  couriers: { accruedMinor: number; paidMinor: number; balanceMinor: number; lines: CourierLine[] };
  ai: {
    source: "DOCUMENTED" | "PROVISIONAL" | "NONE"; costUsdMicro: number; costSarMinor: number | null;
    provisionalUsdMicro: number; documentedUsdMicro: number | null; reconciliationDiffUsdMicro: number | null;
    incompleteCount: number; legacyCount: number; topupsUsdMicro: number; topupsSarMinor: number | null; cashOutUsdMicro: number; cashOutSarMinor: number | null; fxSarPerUsd: number | null;
    byStore: { storeId: string | null; costUsdMicro: number; count: number }[]; byPlan: { plan: string; costUsdMicro: number }[]; byFeature: { feature: string; costUsdMicro: number }[];
    revenueRatio: number | null;
  };
  result: {
    cashReceiptsMinor: number; operatingResultCashMinor: number | null; establishmentPaidMinor: number; netCashFlowMinor: number | null;
    accruedDuesMinor: number; label: string;
  };
  flags: Flag[];
}
