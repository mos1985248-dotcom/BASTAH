import { prisma } from "@/lib/prisma";
import { resolveFeature } from "@/lib/entitlements";

export async function remindAbandonedCart(id: string, storeId: string, now = new Date()) {
  try {
    return await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM abandoned_carts WHERE id = ${id} AND "storeId" = ${storeId} FOR UPDATE`;
      const cart = await tx.abandonedCart.findFirst({
        where: { id, storeId, status: { in: ["DETECTED", "REMINDED"] } },
        include: { store: { select: { nameAr: true } } },
      });
      if (!cart) return false;
      const [access, reminder] = await Promise.all([
        resolveFeature(tx, storeId, "abandoned_carts", now), resolveFeature(tx, storeId, "cart_reminders", now),
      ]);
      if (!access.allowed || !reminder.allowed) return false;
      const consent = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM cart_contact_consents
        WHERE "userId" = ${cart.userId} AND "storeId" = ${storeId} AND "revokedAt" IS NULL FOR UPDATE
      `;
      if (!consent.length) return false;
      const order = await tx.order.findFirst({
        where: { buyerId: cart.userId, storeId, createdAt: { gte: cart.cartUpdatedAt }, status: { notIn: ["CANCELLED", "REFUNDED"] } },
        select: { id: true },
      });
      if (order) return false;
      const since = new Date(now.getTime() - 7 * 86_400_000);
      const sent = await tx.cartReminderAttempt.count({
        where: { cartId: id, cartUpdatedAt: cart.cartUpdatedAt, status: "SENT" },
      });
      const historical = sent || (cart.remindedAt ? 1 : 0);
      if (historical >= (reminder.limit ?? 1) || (cart.remindedAt && cart.remindedAt > since)) return false;
      await tx.notification.create({ data: {
        userId: cart.userId, type: "SYSTEM", titleAr: "منتجاتك بانتظارك في السلة",
        bodyAr: `لديك ${cart.itemCount} منتج من متجر "${cart.store.nameAr}" في سلتك.`,
        data: { abandonedCartId: id, href: "/cart" },
      } });
      await tx.abandonedCart.update({ where: { id }, data: { status: "REMINDED", remindedAt: now } });
      await tx.cartReminderAttempt.create({ data: { cartId: id, cartUpdatedAt: cart.cartUpdatedAt, status: "SENT" } });
      return true;
    });
  } catch (error) {
    const cart = await prisma.abandonedCart.findFirst({ where: { id, storeId }, select: { cartUpdatedAt: true } });
    if (cart) await prisma.cartReminderAttempt.create({ data: { cartId: id, ...cart, status: "FAILED" } });
    throw error;
  }
}

export async function sendAbandonedCartReminders(now = new Date()) {
  const pending = await prisma.$queryRaw<{ id: string; storeId: string }[]>`
    SELECT cart.id, cart."storeId" FROM abandoned_carts cart
    JOIN cart_contact_consents consent
      ON consent."storeId" = cart."storeId" AND consent."userId" = cart."userId"
    WHERE cart.status = 'DETECTED' AND consent."revokedAt" IS NULL
      AND cart."cartUpdatedAt" >= ${new Date(now.getTime() - 7 * 86_400_000)}
    ORDER BY cart."detectedAt" DESC LIMIT 300
  `;
  let reminded = 0;
  for (const cart of pending) {
    try {
      if (await remindAbandonedCart(cart.id, cart.storeId, now)) reminded++;
    } catch {
      console.error("[abandoned-carts] Reminder transaction failed");
    }
  }
  return { reminded, merchantEvents: 0 };
}
