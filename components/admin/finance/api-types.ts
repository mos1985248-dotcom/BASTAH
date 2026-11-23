// components/admin/finance/api-types.ts — شكل استجابة /api/admin/finance/summary (أنواع فقط، بلا كود خادم).
import type { BreakEvenOut } from "@/lib/finance/breakeven";
import type { MonthKey } from "@/lib/finance/riyadh";
import type { MonthlySummary, VatMode } from "@/lib/finance/types";

export interface SummaryResponse {
  month: MonthKey;
  summary: MonthlySummary;
  breakEven: BreakEvenOut;
  history: { month: MonthKey; cashReceiptsMinor: number; operatingResultCashMinor: number | null; expensesMinor: number }[];
  settings: { vatMode: VatMode; localDirectCostSar: number; shipmentGapSharePct: number };
  planNames: Record<string, string>;
  storeNames: Record<string, string>;
  allTime: { subscriptionsGrossMinor: number; subscriptionRefundsMinor: number; subscriptionsNetMinor: number; receiptsMinor: number; expensesPaidMinor: number; establishmentPaidMinor: number; courierPayoutsMinor: number };
}
