import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireActiveStore } from "@/lib/auth";
import { comparableMarket } from "@/lib/pricing/market";
import { prisma } from "@/lib/prisma";

const input = z.object({ name: z.string().trim().min(5).max(150), categoryId: z.string().cuid().optional() }).strict();

export async function POST(request: Request) {
  try {
    const { storeId } = await requireActiveStore();
    const body = input.safeParse(await request.json().catch(() => null));
    if (!body.success) return NextResponse.json({ band: null });

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sales = await prisma.orderItem.findMany({
      where: {
        nameAr: body.data.name,
        variantId: null,
        price: { gt: 0 },
        product: { nameAr: body.data.name, categoryId: body.data.categoryId ?? { not: null }, status: "ACTIVE" },
        order: { storeId: { not: storeId }, status: "DELIVERED", paymentStatus: "PAID", deliveredAt: { gte: since }, discountAmount: 0 },
      },
      select: { price: true, orderId: true, order: { select: { storeId: true } }, product: { select: { categoryId: true } } },
      orderBy: { id: "desc" },
      take: 300,
    });
    const band = comparableMarket(sales.flatMap(({ price, orderId, order, product }) => product.categoryId
      ? [{ price, orderId, storeId: order.storeId, categoryId: product.categoryId }]
      : []));
    return NextResponse.json({ band }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[POST /api/products/pricing-market]", error);
    return NextResponse.json({ error: "تعذّرت مقارنة السعر" }, { status: 500 });
  }
}
