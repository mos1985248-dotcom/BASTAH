// lib/finance/statement.ts — كشف حساب المندوب: الشحنات المسلَّمة والدفعات والرصيد، مع الشحنات «غير الموثقة» مفصولة.
import { prisma } from "@/lib/prisma";
import { mapShipments, SHIPMENT_SELECT } from "./data";
import { sum, toMinor } from "./money";
import { courierBalanceMinor } from "./settlements-service";

export interface StatementRow {
  shipmentId: string; orderNumber: string; deliveredAt: Date; city: string;
  deliveryFeeMinor: number | null; wageMinor: number | null; dueStatus: "DOCUMENTED" | "UNDOCUMENTED"; allocatedMinor: number; paymentStatus: "PAID" | "PARTIAL" | "UNPAID" | "NA";
}

export async function courierStatement(courierId: string, from: Date, to: Date) {
  const courier = await prisma.cityCourier.findUnique({ where: { id: courierId }, select: { id: true, name: true, city: true, phone: true, isActive: true, commissionPerShipment: true } });
  if (!courier) return null;

  const rows = await prisma.shipment.findMany({ where: { courierId, status: "DELIVERED", deliveredAt: { gte: from, lt: to } }, select: SHIPMENT_SELECT, orderBy: { deliveredAt: "asc" } });
  const eligible = rows.filter((r) => !["CANCELLED", "REFUNDED"].includes(r.order.status));
  const mapped = await mapShipments(prisma, eligible, [{ id: courier.id, name: courier.name, commissionPerShipment: courier.commissionPerShipment }]);
  const orders = await prisma.order.findMany({ where: { id: { in: eligible.map((r) => r.orderId) } }, select: { id: true, orderNumber: true, shippingCity: true } });
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const allocs = await prisma.financeSettlementAllocation.findMany({
    where: { shipmentId: { in: mapped.map((m) => m.id) }, settlement: { kind: "COURIER_PAYOUT" as never, partyType: "COURIER", partyRef: courierId } },
    select: { shipmentId: true, amount: true },
  });
  const allocated = new Map<string, number>();
  for (const a of allocs) allocated.set(a.shipmentId as string, (allocated.get(a.shipmentId as string) ?? 0) + (toMinor(a.amount) ?? 0));

  const lines: StatementRow[] = mapped.map((m) => {
    const wage = m.assignment?.wageMinor ?? null;
    const documented = !!m.assignment && wage !== null && m.assignment.deliveryFeeMinor !== null;
    const paid = allocated.get(m.id) ?? 0;
    return {
      shipmentId: m.id, orderNumber: orderById.get(m.orderId)?.orderNumber ?? "", city: orderById.get(m.orderId)?.shippingCity ?? "", deliveredAt: m.deliveredAt as Date,
      deliveryFeeMinor: m.assignment?.deliveryFeeMinor ?? null, wageMinor: wage, dueStatus: documented ? "DOCUMENTED" : "UNDOCUMENTED", allocatedMinor: paid,
      paymentStatus: !documented ? "NA" : paid <= 0 ? "UNPAID" : paid >= (wage as number) ? "PAID" : "PARTIAL",
    };
  });

  const payments = await prisma.financeSettlement.findMany({ where: { kind: "COURIER_PAYOUT" as never, partyType: "COURIER", partyRef: courierId, settledAt: { gte: from, lt: to } }, orderBy: { settledAt: "asc" } });
  const documentedLines = lines.filter((l) => l.dueStatus === "DOCUMENTED");
  const balance = await courierBalanceMinor(courierId);
  const counts = await prisma.shipment.groupBy({ by: ["status"], where: { courierId }, _count: { _all: true } });
  const countOf = (...statuses: string[]) => sum(counts.filter((c) => statuses.includes(c.status)).map((c) => c._count._all));

  return {
    courier: { id: courier.id, name: courier.name, city: courier.city, phone: courier.phone, isActive: courier.isActive },
    period: { from, to },
    lines,
    payments: payments.map((p) => ({ id: p.id, settledAt: p.settledAt, amountMinor: toMinor(p.amount) ?? 0, isReversal: p.isReversal, method: p.method, reference: p.reference, note: p.note })),
    totals: {
      deliveredInPeriod: lines.length, documentedCount: documentedLines.length, undocumentedCount: lines.length - documentedLines.length,
      accruedInPeriodMinor: sum(documentedLines.map((l) => l.wageMinor as number)),
      paidInPeriodMinor: sum(payments.map((p) => (p.isReversal ? -1 : 1) * (toMinor(p.amount) ?? 0))),
      accruedAllTimeMinor: balance.accruedMinor, balanceAllTimeMinor: balance.outstandingMinor,
    },
    shipmentsByStatus: { assigned: countOf("PENDING", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED", "CANCELLED"), delivered: countOf("DELIVERED"), failedOrReturned: countOf("FAILED", "RETURNED") },
  };
}
