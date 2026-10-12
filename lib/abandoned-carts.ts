// lib/abandoned-carts.ts
// كشف السلات المتروكة + حساب الاسترداد. يُستدعى من الكرون فقط.
// التعريف: سلة (مشتري × متجر) لم يُعدَّل أي عنصر فيها منذ ≥ 6 ساعات وأقل من
// 7 أيام، ولا يوجد للمشتري طلب غير ملغى بنفس المتجر بعد آخر تعديل عليها.
// (شرط الطلب يحمي من حالة فشل تنظيف السلة من المتصفح بعد الشراء — checkout
// يحذف العناصر من العميل ويبتلع الأخطاء، فبقاء عنصر ≠ ترك السلة دائماً.)

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const MIN_IDLE_HOURS = 6;
export const MAX_AGE_DAYS = 7;
export const RE_REMIND_DAYS = 7;
const HOUR = 60 * 60 * 1000;

export interface DetectSummary { detected: number; recovered: number }

/** يحوّل REMINDED → RECOVERED عند وجود طلب لاحق للتذكير (بلا أي hook على checkout) */
async function markRecovered(now: Date): Promise<number> {
  const reminded = await prisma.abandonedCart.findMany({
    where: { status: "REMINDED", remindedAt: { not: null } },
    take: 500,
  });
  let count = 0;
  for (const rec of reminded) {
    const order = await prisma.order.findFirst({
      where: { buyerId: rec.userId, storeId: rec.storeId, createdAt: { gt: rec.remindedAt! }, status: { notIn: ["CANCELLED", "REFUNDED"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true, total: true },
    });
    if (!order) continue;
    const res = await prisma.abandonedCart.updateMany({
      where: { id: rec.id, status: "REMINDED" }, // حارس ذرّي ضد تشغيلين متزامنين
      data: { status: "RECOVERED", recoveredAt: now, recoveredOrderId: order.id, recoveredValue: order.total },
    });
    count += res.count;
  }
  return count;
}

export async function detectAbandonedCarts(now = new Date()): Promise<DetectSummary> {
  const recovered = await markRecovered(now);
  const idleCutoff = new Date(now.getTime() - MIN_IDLE_HOURS * HOUR);
  const oldest = new Date(now.getTime() - MAX_AGE_DAYS * 24 * HOUR);

  // نجلب كل عناصر آخر 7 أيام (لا الخاملة فقط) كي نرى أحدث تعديل بكل سلة
  const items = await prisma.cartItem.findMany({
    where: { updatedAt: { gte: oldest }, product: { status: "ACTIVE" }, user: { isActive: true } },
    include: { product: { select: { storeId: true, price: true } }, variant: { select: { price: true } } },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const groups = new Map<string, { userId: string; storeId: string; count: number; value: number; latest: Date }>();
  for (const it of items) {
    const key = `${it.userId}:${it.product.storeId}`;
    const unit = it.variant?.price ?? it.product.price;
    const g = groups.get(key) ?? { userId: it.userId, storeId: it.product.storeId, count: 0, value: 0, latest: it.updatedAt };
    g.count += 1;
    g.value += unit * it.quantity;
    if (it.updatedAt > g.latest) g.latest = it.updatedAt;
    groups.set(key, g);
  }

  let detected = 0;
  for (const g of Array.from(groups.values())) {
    if (g.latest > idleCutoff) continue; // ما زالت نشطة

    const hasLaterOrder = await prisma.order.findFirst({
      where: { buyerId: g.userId, storeId: g.storeId, createdAt: { gte: g.latest }, status: { not: "CANCELLED" } },
      select: { id: true },
    });
    if (hasLaterOrder) continue;

    const existing = await prisma.abandonedCart.findUnique({ where: { userId_storeId: { userId: g.userId, storeId: g.storeId } } });
    const data = {
      status: "DETECTED" as const, itemCount: g.count, cartValue: Math.round(g.value * 100) / 100, cartUpdatedAt: g.latest,
      detectedAt: now, remindedAt: null, merchantEventSentAt: null, recoveredAt: null, recoveredOrderId: null, recoveredValue: null,
    };

    try {
      if (!existing) {
        await prisma.abandonedCart.create({ data: { userId: g.userId, storeId: g.storeId, ...data } });
      } else {
        if (existing.cartUpdatedAt >= g.latest) continue; // نفس السلة عولجت سابقاً
        const lastTouch = existing.remindedAt ?? existing.detectedAt;
        if (now.getTime() - lastTouch.getTime() < RE_REMIND_DAYS * 24 * HOUR) continue; // لا إزعاج: تذكير واحد/أسبوع
        await prisma.abandonedCart.update({ where: { id: existing.id }, data });
      }
      detected++;
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err; // سباق تشغيلين: الآخر سبقنا
    }
  }
  return { detected, recovered };
}
