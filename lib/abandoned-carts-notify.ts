// lib/abandoned-carts-notify.ts
// إرسال التذكيرات للسجلات DETECTED: (1) إشعار داخل التطبيق للمشتري،
// (2) حدث cart.abandoned عبر محرك التكاملات (يتحكم به توجيه الإدارة؛ للمتاجر التي ربطت حساباً).
// ⚠️ خصوصية: حدث التاجر مجهول الهوية افتراضياً (لا اسم/جوال/إيميل). فقط إن
// وُجدت موافقة صريحة سارية من المشتري لهذا المتجر بالذات (CartContactConsent،
// revokedAt = null وقت الإرسال) يُضاف customer {name, phone} — لا إيميل أبداً.

import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { emitIntegrationEvent } from "@/lib/integrations/engine";

export interface NotifySummary { reminded: number; merchantEvents: number }

export async function sendAbandonedCartReminders(now = new Date()): Promise<NotifySummary> {
  const pending = await prisma.abandonedCart.findMany({
    where: { status: "DETECTED" },
    include: { store: { select: { nameAr: true } } },
    take: 300,
  });
  const summary: NotifySummary = { reminded: 0, merchantEvents: 0 };

  for (const rec of pending) {
    // حارس ذرّي: من يربح هذا التحديث هو الوحيد الذي يرسل (تشغيلان متزامنان لا يكرّران التذكير)
    const claim = await prisma.abandonedCart.updateMany({
      where: { id: rec.id, status: "DETECTED" },
      data: { status: "REMINDED", remindedAt: now },
    });
    if (claim.count !== 1) continue;

    try {
      await createNotification({
        userId: rec.userId,
        type: "SYSTEM",
        titleAr: "منتجاتك بانتظارك في السلة",
        bodyAr: `لديك ${rec.itemCount} منتج من متجر "${rec.store.nameAr}" في سلتك. يمكنك إكمال طلبك في أي وقت.`,
        data: { abandonedCartId: rec.id, href: "/cart" },
      });
      summary.reminded++;
    } catch {
      // فشل الإشعار: نُرجع السجل ليُعاد المحاولة بالدورة القادمة
      await prisma.abandonedCart.updateMany({ where: { id: rec.id, status: "REMINDED" }, data: { status: "DETECTED", remindedAt: null } });
      continue;
    }

    if (await sendMerchantEvent(rec, now)) summary.merchantEvents++;
  }
  return summary;
}

async function sendMerchantEvent(
  rec: { id: string; storeId: string; userId: string; itemCount: number; cartValue: number; cartUpdatedAt: Date },
  now: Date,
): Promise<boolean> {
  // متجر بلا حساب خارجي مربوط = لم يوافق على التكاملات: لا نحمّل بيانات السلة ولا الموافقة أصلاً
  // (المحرك يتحقق أيضاً؛ هذا الفحص المسبق يمنع تحميل بيانات شخصية بلا حاجة)
  if ((await prisma.storeMarketingLink.count({ where: { storeId: rec.storeId } })) === 0) return false;

  const items = await prisma.cartItem.findMany({
    where: { userId: rec.userId, product: { storeId: rec.storeId, status: "ACTIVE" } },
    include: { product: { select: { id: true, nameAr: true, price: true } }, variant: { select: { price: true } } },
  });
  const consent = await prisma.cartContactConsent.findUnique({
    where: { userId_storeId: { userId: rec.userId, storeId: rec.storeId } },
    include: { user: { select: { name: true, phone: true } } },
  });
  const customer = consent && consent.revokedAt === null
    ? { name: consent.user.name, phone: consent.user.phone ?? null }
    : null;

  const data = {
    cartId: rec.id,
    contactConsent: customer !== null,
    ...(customer ? { customer } : {}),
    currency: "SAR",
    itemCount: rec.itemCount,
    cartValue: rec.cartValue,
    idleHours: Math.round((now.getTime() - rec.cartUpdatedAt.getTime()) / 3_600_000),
    items: items.map((i) => ({ productId: i.product.id, name: i.product.nameAr, quantity: i.quantity, unitPrice: i.variant?.price ?? i.product.price })),
  };

  const outcome = await emitIntegrationEvent({ type: "cart.abandoned", source: "cart-recovery", storeId: rec.storeId, data });
  const sent = outcome.status === "delivered" || outcome.status === "partial";
  if (sent) await prisma.abandonedCart.update({ where: { id: rec.id }, data: { merchantEventSentAt: now } });
  return sent;
}
