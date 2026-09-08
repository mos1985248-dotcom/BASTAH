// app/api/wishlist/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي فقط) — يستخدم موديل WishlistItem
// الموجود أصلاً بالـ schema بدون أي route سابق. كل عملية مقيَّدة بـ
// userId الحالي فقط (ownership check ضمني عبر requireUser + userId بالـ where).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { z } from "zod";

const addSchema = z.object({ productId: z.string().cuid() });

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        product: {
          select: {
            id: true, nameAr: true, mainImage: true, price: true, comparePrice: true,
            avgRating: true, totalReviews: true,
            store: { select: { id: true, nameAr: true, slug: true, city: true } },
          },
        },
      },
    });
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المفضلة" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "معرّف منتج غير صالح" }, { status: 400 });

    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
      create: { userId: user.id, productId: parsed.data.productId },
      update: {},
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json({ error: "تعذّرت إضافة المنتج للمفضلة" }, { status: 500 });
  }
}
