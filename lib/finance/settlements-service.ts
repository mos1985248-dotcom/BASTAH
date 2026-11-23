// lib/finance/settlements-service.ts — سجل التسويات (دفعات المناديب + تحصيلات بسطة). تسجيل ومتابعة فقط؛ لا تحويلات فعلية.
// الحماية: مفتاح منع تكرار فريد + معاملة متسلسلة + سقف المستحق المحسوب بالمحرك نفسه + تصحيح بقيد عكسي لا بالحذف.
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapShipments, SHIPMENT_SELECT } from "./data";
import { fromMinor, sum, toMinor } from "./money";
import { allocateOldestFirst, validateSettlementAmount } from "./rules";
import { firstPerOrder, isEligible, settled } from "./shipping";
import { auditTx, FinanceError, isUniqueViolation, serializable, type Tx } from "./tx";
import type { SettlementKind, SettlementIn, ShipmentIn } from "./types";

const KINDS = ["COURIER_PAYOUT", "COMMISSION_RECEIPT", "LOCAL_DELIVERY_RECEIPT", "COD_SHARE_RECEIPT"] as const;
const PARTY_OK: Record<(typeof KINDS)[number], readonly string[]> = {
  COURIER_PAYOUT: ["COURIER"], COMMISSION_RECEIPT: ["MERCHANT"], LOCAL_DELIVERY_RECEIPT: ["MERCHANT"], COD_SHARE_RECEIPT: ["MERCHANT", "CARRIER"],
};

export const settlementSchema = z.object({
  kind: z.enum(KINDS, { errorMap: () => ({ message: "نوع التسوية غير صالح" }) }),
  partyType: z.enum(["COURIER", "CARRIER", "MERCHANT"], { errorMap: () => ({ message: "الطرف غير صالح" }) }),
  partyRef: z.string().trim().min(1, "الطرف مطلوب").max(100),
  amount: z.coerce.number({ invalid_type_error: "المبلغ غير صالح" }).positive("المبلغ يجب أن يكون موجباً").max(10_000_000),
  settledAt: z.coerce.date({ errorMap: () => ({ message: "تاريخ التسوية غير صالح" }) }),
  method: z.string().trim().max(40).nullable().optional(),
  reference: z.string().trim().max(120).nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
  idempotencyKey: z.string().trim().min(8, "مفتاح منع التكرار قصير").max(100),
  shipmentIds: z.array(z.string()).max(500).optional(),
});
export type SettlementInput = z.infer<typeof settlementSchema>;

interface DueRow { shipmentId: string; orderId: string; dueMinor: number; deliveredAt: Date }

function dueRows(kind: SettlementKind, partyType: string, partyRef: string, all: ShipmentIn[]): DueRow[] {
  const scoped = all.filter(isEligible).filter((s) => (partyType === "CARRIER" ? s.carrierKey === partyRef : true));
  const row = (s: ShipmentIn, dueMinor: number | null): DueRow[] => (dueMinor !== null && dueMinor > 0 ? [{ shipmentId: s.id, orderId: s.orderId, dueMinor, deliveredAt: s.deliveredAt as Date }] : []);
  switch (kind) {
    case "COURIER_PAYOUT": return scoped.filter((s) => s.courierId === partyRef).flatMap((s) => row(s, s.assignment?.wageMinor ?? null));
    case "COMMISSION_RECEIPT": return firstPerOrder(scoped.filter((s) => !s.courierId)).flatMap((s) => row(s, s.basitaFeeMinor));
    case "LOCAL_DELIVERY_RECEIPT": return scoped.filter((s) => !!s.courierId).flatMap((s) => row(s, s.assignment?.deliveryFeeMinor ?? null));
    case "COD_SHARE_RECEIPT":
      return firstPerOrder(scoped).filter((s) => s.paymentMethod === "CASH_ON_DELIVERY" && s.codFeeMinor > 0 && s.codCarrierShareMinor !== null)
        .flatMap((s) => row(s, s.codFeeMinor - (s.codCarrierShareMinor as number)));
    default: return [];
  }
}

async function dueState(tx: Tx, kind: SettlementKind, partyType: string, partyRef: string) {
  const where: Prisma.ShipmentWhereInput = { status: "DELIVERED", deliveredAt: { not: null } };
  if (kind === "COURIER_PAYOUT") where.courierId = partyRef;
  else if (partyType === "MERCHANT") where.order = { storeId: partyRef };
  const shipments = await mapShipments(tx, await tx.shipment.findMany({ where, select: SHIPMENT_SELECT }), []);
  const rows = dueRows(kind, partyType, partyRef, shipments);
  const [allocs, settlements] = await Promise.all([
    tx.financeSettlementAllocation.findMany({ where: { shipmentId: { in: rows.map((r) => r.shipmentId) }, settlement: { kind: kind as never, partyType, partyRef } }, select: { shipmentId: true, amount: true } }),
    tx.financeSettlement.findMany({ where: { kind: kind as never, partyType, partyRef }, select: { amount: true, isReversal: true } }),
  ]);
  const allocated = new Map<string, number>();
  for (const a of allocs) allocated.set(a.shipmentId as string, (allocated.get(a.shipmentId as string) ?? 0) + (toMinor(a.amount) ?? 0));
  const received = sum(settlements.map((s) => (s.isReversal ? -1 : 1) * (toMinor(s.amount) ?? 0)));
  return { rows, allocated, outstandingMinor: sum(rows.map((r) => r.dueMinor)) - received };
}

export async function recordSettlement(actorId: string, input: SettlementInput) {
  if (!PARTY_OK[input.kind].includes(input.partyType)) throw new FinanceError("نوع التسوية لا يناسب هذا الطرف");
  const existing = await prisma.financeSettlement.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { allocations: true } });
  if (existing) return { settlement: existing, duplicate: true };

  try {
    return await serializable(async (tx) => {
      // سباق متزامن بالمفتاح نفسه: النتيجة الأصلية تُعاد (لا خطأ تجاوز مستحق مضلِّل)
      const dup = await tx.financeSettlement.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { allocations: true } });
      if (dup) return { settlement: dup, duplicate: true };

      const state = await dueState(tx, input.kind, input.partyType, input.partyRef);
      const amountMinor = toMinor(input.amount) as number;
      const check = validateSettlementAmount(amountMinor, state.outstandingMinor);
      if (!check.ok) throw new FinanceError(check.reason as string, 409);

      const pool = input.shipmentIds?.length ? state.rows.filter((r) => input.shipmentIds!.includes(r.shipmentId)) : state.rows;
      const allocation = allocateOldestFirst(amountMinor, pool.map((r) => ({ shipmentId: r.shipmentId, dueMinor: r.dueMinor, allocatedMinor: state.allocated.get(r.shipmentId) ?? 0, deliveredAt: r.deliveredAt })));
      if (!allocation) throw new FinanceError("المبلغ يتجاوز المتبقي على الشحنات المختارة", 409);
      const orderOf = new Map(state.rows.map((r) => [r.shipmentId, r.orderId]));

      const row = await tx.financeSettlement.create({
        data: {
          kind: input.kind as never, partyType: input.partyType, partyRef: input.partyRef, amount: fromMinor(amountMinor), settledAt: input.settledAt,
          method: input.method ?? null, reference: input.reference ?? null, note: input.note ?? null, idempotencyKey: input.idempotencyKey, createdById: actorId,
          allocations: { create: allocation.map((a) => ({ shipmentId: a.shipmentId, orderId: orderOf.get(a.shipmentId) ?? null, amount: fromMinor(a.amountMinor) })) },
        },
        include: { allocations: true },
      });
      await auditTx(tx, { actorId, action: "FINANCE_SETTLEMENT_RECORDED", targetType: "FinanceSettlement", targetId: row.id, metadata: { kind: input.kind, partyType: input.partyType, partyRef: input.partyRef, amount: input.amount, outstandingBefore: fromMinor(state.outstandingMinor), allocations: allocation.length } });
      return { settlement: row, duplicate: false };
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      const again = await prisma.financeSettlement.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { allocations: true } });
      if (again) return { settlement: again, duplicate: true };
    }
    throw err;
  }
}

/** تصحيح بقيد عكسي: يبقى الأصل ظاهراً، ويُنشأ قيد مساوٍ بمخصصات سالبة. مرة واحدة فقط لكل تسوية. */
export async function reverseSettlement(actorId: string, id: string, reason: string) {
  if (reason.trim().length < 3) throw new FinanceError("سبب التصحيح مطلوب");
  try {
    return await serializable(async (tx) => {
      const original = await tx.financeSettlement.findUnique({ where: { id }, include: { allocations: true } });
      if (!original) throw new FinanceError("التسوية غير موجودة", 404);
      if (original.isReversal) throw new FinanceError("هذا قيد عكسي ولا يُعكس", 409);
      if (await tx.financeSettlement.findUnique({ where: { reversalOfId: id } })) throw new FinanceError("سبق عكس هذه التسوية", 409);

      const row = await tx.financeSettlement.create({
        data: {
          kind: original.kind, partyType: original.partyType, partyRef: original.partyRef, amount: original.amount, settledAt: new Date(),
          note: `عكس تسوية: ${reason.trim()}`, isReversal: true, reversalOfId: id, idempotencyKey: `rev:${id}`, createdById: actorId,
          allocations: { create: original.allocations.map((a) => ({ shipmentId: a.shipmentId, orderId: a.orderId, amount: fromMinor(-(toMinor(a.amount) ?? 0)) })) },
        },
      });
      await auditTx(tx, { actorId, action: "FINANCE_SETTLEMENT_REVERSED", targetType: "FinanceSettlement", targetId: id, reason, metadata: { reversalId: row.id, amount: Number(original.amount), kind: original.kind } });
      return row;
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new FinanceError("سبق عكس هذه التسوية", 409);
    throw err;
  }
}

export async function listSettlements(opts: { kind?: SettlementKind; partyRef?: string; from?: Date; to?: Date }): Promise<(SettlementIn & { reference: string | null; method: string | null; note: string | null; reversalOfId: string | null })[]> {
  const rows = await prisma.financeSettlement.findMany({
    where: { ...(opts.kind ? { kind: opts.kind as never } : {}), ...(opts.partyRef ? { partyRef: opts.partyRef } : {}), ...(opts.from || opts.to ? { settledAt: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lt: opts.to } : {}) } } : {}) },
    orderBy: { settledAt: "desc" }, take: 500,
  });
  return rows.map((s) => ({ id: s.id, kind: s.kind as SettlementKind, partyType: s.partyType, partyRef: s.partyRef, amountMinor: toMinor(s.amount) ?? 0, settledAt: s.settledAt, isReversal: s.isReversal, reference: s.reference, method: s.method, note: s.note, reversalOfId: s.reversalOfId }));
}

/** رصيد المندوب التراكمي (المستحق الموثَّق − الدفعات الفعلية) من المصدر نفسه الذي يتحقق منه سقف التسوية. */
export async function courierBalanceMinor(courierId: string): Promise<{ accruedMinor: number; outstandingMinor: number }> {
  const state = await dueState(prisma, "COURIER_PAYOUT", "COURIER", courierId);
  return { accruedMinor: sum(state.rows.map((r) => r.dueMinor)), outstandingMinor: state.outstandingMinor };
}

export { settled };
