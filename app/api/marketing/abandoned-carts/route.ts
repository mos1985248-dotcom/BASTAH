import { remindAbandonedCart } from "@/lib/abandoned-carts-notify";
import { authErrorResponse } from "@/lib/auth";
import { requireStoreFeature } from "@/lib/feature-access";
// app/api/marketing/abandoned-carts/route.ts
// إحصاءات السلات المتروكة للمتجر (آخر 30 يوماً) — أرقام حقيقية من AbandonedCart.
// ⚠️ بلا هوية للمشتري إلا عند موافقة صريحة سارية لهذا المتجر (name/phone فقط).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError } from "@/lib/auth";

const WINDOW_DAYS = 30;

export async function GET() {
  try {
    const { storeId } = await requireStoreFeature("abandoned_carts");
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const where = { storeId, detectedAt: { gte: since } };

    const [total, recovered, recent] = await Promise.all([
      prisma.abandonedCart.aggregate({ where, _count: { _all: true }, _sum: { cartValue: true } }),
      prisma.abandonedCart.aggregate({ where: { ...where, status: "RECOVERED" }, _count: { _all: true }, _sum: { recoveredValue: true } }),
      prisma.abandonedCart.findMany({
        where, orderBy: { detectedAt: "desc" }, take: 10,
        select: { id: true, userId: true, cartUpdatedAt: true, status: true, itemCount: true, cartValue: true, detectedAt: true, merchantEventSentAt: true },
      }),
    ]);

    const consents = await prisma.cartContactConsent.findMany({
      where: { storeId, revokedAt: null, userId: { in: recent.map((r) => r.userId) } },
      include: { user: { select: { name: true, phone: true } } },
    });
    const contactByUser = new Map(consents.map((c) => [c.userId, { name: c.user.name, phone: c.user.phone }]));
    const items = await prisma.cartItem.findMany({
      where: { userId: { in: recent.map(row => row.userId) }, product: { storeId } },
      select: { userId: true, quantity: true, updatedAt: true, product: { select: { nameAr: true } } },
    });
    const recentOut = recent.map(({ userId, ...cart }) => ({
      ...cart, contact: contactByUser.get(userId) ?? null,
      items: cart.status === "RECOVERED" ? [] : items
        .filter(item => item.userId === userId && item.updatedAt <= cart.cartUpdatedAt)
        .map(item => ({ name: item.product.nameAr, quantity: item.quantity })),
    }));

    const count = total._count._all;
    const recoveredCount = recovered._count._all;
    return NextResponse.json({
      windowDays: WINDOW_DAYS,
      abandonedCount: count,
      abandonedValue: total._sum.cartValue ?? 0,
      recoveredCount,
      recoveredValue: recovered._sum.recoveredValue ?? 0,
      recoveryRate: count > 0 ? Math.round((recoveredCount / count) * 1000) / 10 : null, // null = لا بيانات بعد
      recent: recentOut,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/marketing/abandoned-carts]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { storeId } = await requireStoreFeature("abandoned_carts");
    const body = await req.json().catch(() => null);
    if (typeof body?.id !== "string" || body.id.length > 100) return Response.json({ error: "معرف السلة غير صالح." }, { status: 400 });
    if (!(await remindAbandonedCart(body.id, storeId))) {
      return Response.json({ error: "السلة غير مؤهلة للتذكير، أو تم بلوغ حد التذكير." }, { status: 409 });
    }
    return Response.json({ ok: true });
  } catch (error) { return authErrorResponse(error); }
}
