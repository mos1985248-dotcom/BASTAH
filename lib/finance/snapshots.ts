// lib/finance/snapshots.ts — تثبيت القيم التاريخية وقت الحدث (تُستدعى من مسارات الطلب والإسناد القائمة، لا تُغيّر القديم).
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fromMinor, toMinor } from "./money";
import { codCarrierShareMinor, pickTerms, type CodTerms } from "./rules";
import { getLocalDirectCostSar } from "./settings";
import { auditTx } from "./tx";

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * يثبّت حصة الناقل من رسم COD على الطلب وقت إنشائه (أو وقت إسناده لمندوب)، بحسب شروط الناقل السارية وقتها.
 * لا يكتب شيئاً إن كان الطلب غير COD أو الحصة مثبَّتة سلفاً أو شروط الناقل ناقصة (يبقى «إعداد التكلفة ناقص»).
 */
export async function snapshotCodShare(db: Db, orderId: string, carrierKey: string): Promise<"SET" | "SKIPPED" | "INCOMPLETE"> {
  const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentMethod: true, codFee: true, total: true, createdAt: true, codCarrierShare: true } });
  if (!order || order.paymentMethod !== "CASH_ON_DELIVERY" || order.codFee <= 0 || order.codCarrierShare !== null) return "SKIPPED";

  const rows = await db.carrierCodTerms.findMany({ where: { carrierKey } });
  const terms: CodTerms[] = rows.map((t) => ({
    carrierKey: t.carrierKey, fixedShare: t.fixedShare === null ? null : Number(t.fixedShare), percentShare: t.percentShare === null ? null : Number(t.percentShare),
    percentBasis: t.percentBasis as CodTerms["percentBasis"], effectiveFrom: t.effectiveFrom,
  }));
  const applied = pickTerms(terms, carrierKey, order.createdAt);
  const share = codCarrierShareMinor(applied, toMinor(order.total) ?? 0, toMinor(order.codFee) ?? 0);
  if (share === null || !applied) return "INCOMPLETE";

  await db.order.update({
    where: { id: orderId },
    data: {
      codCarrierShare: fromMinor(share),
      codShareTerms: { carrierKey, fixedShare: applied.fixedShare, percentShare: applied.percentShare, percentBasis: applied.percentBasis, effectiveFrom: applied.effectiveFrom.toISOString() } as Prisma.InputJsonValue,
    },
  });
  return "SET";
}

/**
 * يثبّت قيمة التوصيل وأجر المندوب والتكلفة المباشرة وقت الإسناد. إعادة الإسناد لمندوب آخر تُنهي الإسناد السابق (سجل التغيير)
 * فلا يتضاعف المستحق. إعادة الإسناد للمندوب نفسه (مثل إعادة إرسال واتساب) لا تُنشئ سجلاً جديداً.
 * الأجر المجهول (لم يُضبط للمندوب) يُحفظ null فتبقى الشحنة «غير موثقة» بدل اختراع قيمة.
 */
export async function snapshotCourierAssignment(db: Db, p: { shipmentId: string; courierId: string; actorId?: string | null; reason?: string }) {
  const [shipment, courier, directCost] = await Promise.all([
    db.shipment.findUnique({ where: { id: p.shipmentId }, select: { orderId: true, order: { select: { shippingCost: true } } } }),
    db.cityCourier.findUnique({ where: { id: p.courierId }, select: { commissionPerShipment: true } }),
    getLocalDirectCostSar(db),
  ]);
  if (!shipment || !courier) return null;

  const active = await db.courierAssignment.findMany({ where: { shipmentId: p.shipmentId, supersededAt: null } });
  const same = active.find((a) => a.courierId === p.courierId);
  if (same) return same;

  if (active.length) {
    await db.courierAssignment.updateMany({ where: { shipmentId: p.shipmentId, supersededAt: null }, data: { supersededAt: new Date(), supersededReason: p.reason ?? "إعادة إسناد" } });
  }
  const row = await db.courierAssignment.create({
    data: {
      shipmentId: p.shipmentId, courierId: p.courierId,
      wageSnapshot: courier.commissionPerShipment ?? null, deliveryFeeSnapshot: shipment.order.shippingCost, directCostSnapshot: directCost,
      createdById: p.actorId ?? null,
    },
  });
  if (p.actorId && "$transaction" in db === false) {
    await auditTx(db as Prisma.TransactionClient, { actorId: p.actorId, action: "COURIER_ASSIGNED", targetType: "Shipment", targetId: p.shipmentId, metadata: { courierId: p.courierId, wage: row.wageSnapshot === null ? null : Number(row.wageSnapshot), deliveryFee: Number(row.deliveryFeeSnapshot), reassigned: active.length > 0 } });
  }
  return row;
}
