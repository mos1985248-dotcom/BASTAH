// lib/finance/data.ts — يحمّل البيانات الخام من قاعدة البيانات (قراءة فقط) ويحوّلها لأشكال المحرك.
// كل شيء هنا SELECT؛ لا كتابة. الحساب نفسه في engine.ts/build.ts النقيين.
import { prisma } from "@/lib/prisma";
import { buildMonthInput, type AiRowIn, type RawFinanceData } from "./build";
import { summarizeMonth } from "./engine";
import { toMicroUsd, toMinor } from "./money";
import { lastMonths, monthRangeUtc, shiftMonth, type MonthKey } from "./riyadh";
import { getVatMode } from "./settings";
import type { MonthlySummary, SettlementKind, ShipmentIn } from "./types";


type Db = Pick<typeof prisma, "shippingRate" | "courierAssignment">;
type ShipmentRow = Awaited<ReturnType<typeof prisma.shipment.findMany<{ select: typeof SHIPMENT_SELECT }>>>[number];
type CourierRow = { id: string; name: string; commissionPerShipment: number | null };

export const SHIPMENT_SELECT = {
  id: true, orderId: true, deliveredAt: true, status: true, courierId: true, carrier: true, carrierCode: true,
  order: { select: { storeId: true, status: true, paymentMethod: true, codFee: true, shippingCost: true, codCarrierShare: true } },
} as const;

/** يحوّل صفوف Shipment إلى أشكال المحرك (عمولة بسطة المحفوظة، لقطة الإسناد، لقطة COD). قراءة فقط. */
export async function mapShipments(db: Db, shipments: ShipmentRow[], couriers: CourierRow[]): Promise<ShipmentIn[]> {
  const orderIds = [...new Set(shipments.map((s) => s.orderId))];
  const shipmentIds = shipments.map((s) => s.id);
  const [rates, assignments] = await Promise.all([
    db.shippingRate.findMany({ where: { orderId: { in: orderIds } }, select: { orderId: true, basitaFee: true } }),
    db.courierAssignment.findMany({ where: { shipmentId: { in: shipmentIds }, supersededAt: null } }),
  ]);
  const feeByOrder = new Map(rates.map((r) => [r.orderId as string, toMinor(r.basitaFee)]));
  const assignByShipment = new Map(assignments.map((a) => [a.shipmentId, a]));
  const courierById = new Map(couriers.map((c) => [c.id, c]));
  return shipments.map((s) => {
    const a = assignByShipment.get(s.id);
    const c = s.courierId ? courierById.get(s.courierId) : undefined;
    return {
      id: s.id, orderId: s.orderId, storeId: s.order.storeId, deliveredAt: s.deliveredAt, status: s.status, orderStatus: s.order.status,
      courierId: s.courierId, carrierKey: s.carrierCode ?? s.carrier ?? null,
      basitaFeeMinor: feeByOrder.get(s.orderId) ?? null,
      assignment: a ? { wageMinor: toMinor(a.wageSnapshot), deliveryFeeMinor: toMinor(a.deliveryFeeSnapshot), directCostMinor: toMinor(a.directCostSnapshot) } : null,
      orderShippingCostMinor: toMinor(s.order.shippingCost) ?? 0,
      courierCurrentWageMinor: c ? toMinor(c.commissionPerShipment) : null,
      paymentMethod: s.order.paymentMethod, codFeeMinor: toMinor(s.order.codFee) ?? 0,
      codCarrierShareMinor: toMinor(s.order.codCarrierShare),
    };
  });
}

export async function loadRaw(lastMonth: MonthKey, monthsBack: number): Promise<RawFinanceData> {
  const first = shiftMonth(lastMonth, -(monthsBack - 1));
  const rangeStart = monthRangeUtc(shiftMonth(first, -11)).start; // 12 شهراً قبل أول شهر لتقدير السنوية
  const firstStart = monthRangeUtc(first).start;
  const { end } = monthRangeUtc(lastMonth);

  const [vatMode, invoices, refunds, refundedStatus, trialCount, freePlanCount, shipments, failed, settlements, expenses, aiUsage, aiInvoices, couriers] = await Promise.all([
    getVatMode(),
    prisma.subscriptionInvoice.findMany({
      where: { status: "PAID", paidAt: { gte: rangeStart, lt: end } },
      select: { id: true, plan: true, billingCycle: true, amount: true, vatAmount: true, paidAt: true, subscription: { select: { storeId: true } } },
    }),
    prisma.subscriptionRefund.findMany(),
    prisma.subscriptionInvoice.findMany({ where: { status: "REFUNDED" }, select: { id: true } }),
    prisma.storeSubscription.count({ where: { status: "TRIAL" } }),
    prisma.storeSubscription.count({ where: { plan: "FREE", status: "ACTIVE" } }),
    prisma.shipment.findMany({
      where: { status: "DELIVERED", deliveredAt: { lt: end } },
      select: SHIPMENT_SELECT,
    }),
    prisma.shipment.findMany({ where: { status: { in: ["FAILED", "RETURNED"] }, updatedAt: { gte: firstStart, lt: end } }, select: { updatedAt: true } }),
    prisma.financeSettlement.findMany({ where: { settledAt: { lt: end } } }),
    prisma.platformExpense.findMany(),
    prisma.aIUsage.findMany({
      where: { createdAt: { gte: firstStart, lt: end } },
      select: { createdAt: true, storeId: true, feature: true, planAtCall: true, costStatus: true, costUsd: true, estimatedCostUsd: true },
    }),
    prisma.aiProviderInvoice.findMany(),
    prisma.cityCourier.findMany({ select: { id: true, name: true, commissionPerShipment: true } }),
  ]);

  const shipmentsIn = await mapShipments(prisma, shipments, couriers);
  const subs = await prisma.storeSubscription.findMany({ select: { storeId: true, plan: true } });
  const planByStore = new Map(subs.map((x) => [x.storeId, x.plan as string]));

  const refundEvents = new Set(refunds.map((r) => r.invoiceId));
  const aiRows: AiRowIn[] = aiUsage.map((u) => {
    const plan = (u.planAtCall as string | null) ?? (u.storeId ? planByStore.get(u.storeId) ?? null : null);
    return {
      createdAt: u.createdAt, storeId: u.storeId, feature: u.feature, plan, planIsCurrentFallback: !u.planAtCall && plan !== null,
      status: u.costStatus === "COMPLETE" || u.costStatus === "INCOMPLETE" ? u.costStatus : "LEGACY",
      costMicro: toMicroUsd(u.costUsd) ?? 0, estimateMicro: toMicroUsd(u.estimatedCostUsd) ?? 0,
    };
  });

  return {
    vatMode,
    invoicesPaid: invoices.map((i) => ({ id: i.id, plan: i.plan, cycle: i.billingCycle, amountMinor: toMinor(i.amount) ?? 0, vatMinor: toMinor(i.vatAmount), paidAt: i.paidAt as Date, storeId: i.subscription.storeId })),
    refunds: refunds.map((r) => ({ id: r.id, invoiceId: r.invoiceId, amountMinor: toMinor(r.amount) ?? 0, refundedAt: r.refundedAt, isReversal: r.isReversal })),
    statusRefundedWithoutEvent: refundedStatus.filter((i) => !refundEvents.has(i.id)).length,
    trialCount, freePlanCount, shipments: shipmentsIn,
    failedOrReturnedDates: failed.map((f) => f.updatedAt),
    settlements: settlements.map((s) => ({ id: s.id, kind: s.kind as SettlementKind, partyType: s.partyType, partyRef: s.partyRef, amountMinor: toMinor(s.amount) ?? 0, settledAt: s.settledAt, isReversal: s.isReversal })),
    expenses: expenses.map((e) => ({ id: e.id, category: e.category, kind: e.kind, status: e.status, amountMinor: toMinor(e.amount) ?? 0, vatMinor: toMinor(e.vatAmount), expenseDate: e.expenseDate, paidAt: e.paidAt, voided: !!e.voidedAt })),
    aiRows,
    aiInvoices: aiInvoices.map((i) => ({ id: i.id, provider: i.provider, kind: i.kind, periodStart: i.periodStart, periodEnd: i.periodEnd, amountUsdMicro: toMicroUsd(i.amountUsd) ?? 0, fxSarPerUsd: i.fxRateSarPerUsd ? Number(i.fxRateSarPerUsd) : null, fxDate: i.fxRateDate, paidAt: i.paidAt })),
    courierNames: Object.fromEntries(couriers.map((c) => [c.id, c.name])),
  };
}

/** ملخصات آخر `count` شهراً تنتهي بالشهر المعطى (الأقدم أولاً) من تحميل واحد للبيانات. */
export async function summarizeRange(lastMonth: MonthKey, count: number): Promise<MonthlySummary[]> {
  const raw = await loadRaw(lastMonth, count);
  return lastMonths(lastMonth, count).map((m) => summarizeMonth(buildMonthInput(raw, m)));
}

export interface AllTimeTotals {
  subscriptionsGrossMinor: number; subscriptionRefundsMinor: number; subscriptionsNetMinor: number;
  receiptsMinor: number; expensesPaidMinor: number; establishmentPaidMinor: number; courierPayoutsMinor: number;
}

/** إجمالي منذ بداية المشروع على أساس التحصيل الفعلي (فواتير مدفوعة − استردادات + تحصيلات مسجّلة؛ مصروفات مدفوعة؛ دفعات المناديب). */
export async function allTimeTotals(): Promise<AllTimeTotals> {
  const [inv, refunds, expenses, settlements] = await Promise.all([
    prisma.subscriptionInvoice.aggregate({ where: { status: { in: ["PAID", "REFUNDED"] }, paidAt: { not: null } }, _sum: { amount: true } }),
    prisma.subscriptionRefund.groupBy({ by: ["isReversal"], _sum: { amount: true } }),
    prisma.platformExpense.groupBy({ by: ["category"], where: { voidedAt: null, status: "PAID" }, _sum: { amount: true } }),
    prisma.financeSettlement.groupBy({ by: ["kind", "isReversal"], _sum: { amount: true } }),
  ]);
  const m = (v: unknown) => toMinor(v as never) ?? 0;
  const gross = m(inv._sum.amount);
  const refunded = refunds.reduce((a, r) => a + (r.isReversal ? -1 : 1) * m(r._sum.amount), 0);
  const receipts = settlements.filter((x) => x.kind !== "COURIER_PAYOUT" && x.kind !== "OTHER").reduce((a, x) => a + (x.isReversal ? -1 : 1) * m(x._sum.amount), 0);
  const payouts = settlements.filter((x) => x.kind === "COURIER_PAYOUT").reduce((a, x) => a + (x.isReversal ? -1 : 1) * m(x._sum.amount), 0);
  const est = expenses.filter((e) => e.category === "ESTABLISHMENT").reduce((a, e) => a + m(e._sum.amount), 0);
  const all = expenses.reduce((a, e) => a + m(e._sum.amount), 0);
  return { subscriptionsGrossMinor: gross, subscriptionRefundsMinor: refunded, subscriptionsNetMinor: gross - refunded, receiptsMinor: receipts, expensesPaidMinor: all, establishmentPaidMinor: est, courierPayoutsMinor: payouts };
}
