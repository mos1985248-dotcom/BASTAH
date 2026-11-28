import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guestQuote, guestQuoteSchema } from "@/lib/guest-checkout";
import { CheckoutItemError, ShippingCalcError } from "@/lib/checkout-pricing";
import { reserveStock, InsufficientStockError } from "@/lib/inventory";
import { snapshotCodShare } from "@/lib/finance/snapshots";
import { authRateLimit, checkRateLimit } from "@/lib/rate-limit";
import { guestBuyerId, guestOrderId, guestSession } from "@/lib/guest-order-session";

const amount = z.number().finite().nonnegative();
const schema = guestQuoteSchema.extend({
  requestId: z.string().uuid(),
  expected: z.object({ subtotal: amount, shippingCost: amount, codFee: amount, taxAmount: amount, total: amount }),
});
const orderSelect = { id: true, orderNumber: true, total: true } as const;
const noStore = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  if (process.env.GUEST_CHECKOUT_ENABLED !== "true" || !authRateLimit) {
    return NextResponse.json({ error: "شراء الزائر غير متاح حالياً" }, { status: 503 });
  }
  if (req.headers.get("origin") !== req.nextUrl.origin) {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 403 });
  }
  const token = guestSession(req);
  if (!token) return NextResponse.json({ error: "أعد حساب التكلفة قبل تأكيد الطلب" }, { status: 409 });
  try {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success || !parsed.data.phone) {
      return NextResponse.json({ error: "تحقق من بيانات الطلب" }, { status: 400 });
    }
    const data = parsed.data;
    const phone = parsed.data.phone;
    const buyerId = guestBuyerId(token);
    const id = guestOrderId(data.requestId, token);
    const findOrder = () => prisma.order.findFirst({ where: { id, buyerId }, select: orderSelect });
    const respond = (order: { id: string; orderNumber: string; total: number }, status: number) =>
      NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, total: order.total }, { status, headers: noStore });

    const existing = await findOrder();
    if (existing) return respond(existing, 200);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limits = await Promise.all([
      checkRateLimit(authRateLimit, "guest-order:" + ip),
      checkRateLimit(authRateLimit, "guest-phone:" + createHash("sha256").update(phone).digest("hex")),
    ]);
    if (limits.some((limit) => !limit.allowed)) {
      return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقاً" }, { status: 429 });
    }

    const priced = await guestQuote(data).catch(async (error: unknown) => {
      const committed = await findOrder();
      if (committed) return { committed };
      throw error;
    });
    if ("committed" in priced) return respond(priced.committed, 200);
    const { totals, resolved, productNames, shippingRateLogId } = priced;
    const keys = ["subtotal", "shippingCost", "codFee", "taxAmount", "total"] as const;
    if (keys.some((key) => Math.round(totals[key] * 100) !== Math.round(data.expected[key] * 100))) {
      return NextResponse.json({ error: "تغيّرت تكلفة الطلب، أعد حساب الإجمالي" }, { status: 409 });
    }

    try {
      const order = await prisma.$transaction(async (tx) => {
        await tx.user.upsert({
          where: { id: buyerId },
          create: { id: buyerId, name: data.name, role: "BUYER", isActive: false, isVerified: false },
          update: {},
        });
        // Create the unique order before reserving stock so concurrent retries
        // cannot run a second reservation against an already committed order.
        const created = await tx.order.create({
          data: {
            id, orderNumber: "BS-G-" + randomBytes(8).toString("hex").toUpperCase(),
            buyerId, storeId: data.storeId, paymentMethod: data.paymentMethod, fulfillmentMethod: "SHIPPING",
            ...totals, shippingName: data.name, shippingPhone: phone, shippingCity: data.city,
            shippingRegion: data.region, shippingAddress: data.address,
            items: { create: resolved.map((item) => ({
              productId: item.productId, variantId: item.variantId, nameAr: item.nameAr,
              price: item.unitPrice, quantity: item.quantity, total: item.unitPrice * item.quantity,
            })) },
            statusHistory: { create: { status: "PENDING", note: "طلب زائر — الدفع عند الاستلام" } },
          },
          select: orderSelect,
        });
        await reserveStock(tx, resolved, productNames);
        if (shippingRateLogId) {
          const rate = await tx.shippingRate.update({ where: { id: shippingRateLogId }, data: { orderId: created.id } });
          if (totals.codFee > 0) await snapshotCodShare(tx, created.id, String(rate.carrier));
        }
        return created;
      });
      return respond(order, 201);
    } catch (error) {
      const committed = await findOrder();
      if (committed) return respond(committed, 200);
      throw error;
    }
  } catch (error) {
    if (error instanceof CheckoutItemError || error instanceof ShippingCalcError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof InsufficientStockError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "تعذّر إنشاء الطلب، جرّب مرة أخرى" }, { status: 500 });
  }
}
