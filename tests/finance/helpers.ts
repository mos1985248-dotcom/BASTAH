// بناة بيانات الاختبار — قيم افتراضية آمنة، تُستبدل بما يخص كل اختبار.
import type { AiIn, ExpenseIn, InvoiceIn, MonthInput, SettlementIn, ShipmentIn } from "../../lib/finance/types";

export const NOV = { year: 2026, month: 11 };
export const d = (iso: string) => new Date(iso);
export const IN_NOV = d("2026-11-10T09:00:00Z");

export const emptyAi: AiIn = { usage: [], invoices: [] };

export function baseInput(over: Partial<MonthInput> = {}): MonthInput {
  return {
    month: NOV,
    subscriptions: { vatMode: "UNSET", paidInMonth: [], yearlyInCoverage: [], refunds: [], statusRefundedWithoutEvent: 0, trialCount: 0, freePlanCount: 0 },
    shipments: [], failedOrReturnedInMonth: 0, settlements: [], expenses: [], ai: emptyAi, courierNames: { c1: "مندوب ١", c2: "مندوب ٢" },
    ...over,
  };
}

export const invoice = (id: string, amountMinor: number, over: Partial<InvoiceIn> = {}): InvoiceIn =>
  ({ id, plan: "GROWTH", cycle: "monthly", amountMinor, vatMinor: null, paidAt: IN_NOV, ...over });

let seq = 0;
export function ext(over: Partial<ShipmentIn> = {}): ShipmentIn {
  seq += 1;
  return {
    id: `s${seq}`, orderId: `o${seq}`, storeId: "st1", deliveredAt: IN_NOV, status: "DELIVERED", orderStatus: "DELIVERED",
    courierId: null, carrierKey: "ARAMEX", basitaFeeMinor: 300, assignment: null, orderShippingCostMinor: 2500, courierCurrentWageMinor: null,
    paymentMethod: "ONLINE", codFeeMinor: 0, codCarrierShareMinor: null, ...over,
  };
}
export function local(courierId: string, over: Partial<ShipmentIn> = {}): ShipmentIn {
  return ext({ courierId, carrierKey: null, basitaFeeMinor: null, assignment: { wageMinor: 700, deliveryFeeMinor: 1000, directCostMinor: 0 }, ...over });
}

export const settlement = (id: string, kind: SettlementIn["kind"], partyRef: string, amountMinor: number, over: Partial<SettlementIn> = {}): SettlementIn =>
  ({ id, kind, partyType: kind === "COURIER_PAYOUT" ? "COURIER" : "MERCHANT", partyRef, amountMinor, settledAt: IN_NOV, isReversal: false, ...over });

export const expense = (id: string, amountMinor: number, over: Partial<ExpenseIn> = {}): ExpenseIn =>
  ({ id, category: "OPERATIONS", kind: "FIXED", status: "PAID", amountMinor, vatMinor: null, expenseDate: IN_NOV, paidAt: IN_NOV, voided: false, ...over });
