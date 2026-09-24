// app/api/cart/route.ts
// السلة تدعم الآن variantId اختيارياً (migration مبرَّرة على CartItem —
// راجع التعليق بالسكيما). لا يمس /api/checkout مباشرة؛ الواجهة تجمّع عناصر
// السلة حسب storeId وتستدعي /api/checkout الحالي مرة لكل متجر.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { z } from "zod";

const addSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.coerce.number().int().positive().max(99).default(1),
});

const CART_ITEM_SELECT = {
  id: true,
  quantity: true,
  variantId: true,
  variant: { select: { id: true, nameAr: true, options: true, price: true, quantity: true, image: true } },
  product: {
    select: {
      id: true, nameAr: true, mainImage: true, price: true, quantity: true, status: true,
      store: { select: { id: true, nameAr: true, slug: true, city: true, whatsapp: true, pickupEnabled: true, subscription: { select: { bankTransferEnabled: true } } } },
    },
  },
} as const;

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      select: CART_ITEM_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/cart]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب السلة" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = addSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    const { productId, quantity } = parsed.data;
    const variantId = parsed.data.variantId ?? null;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true, variants: { select: { id: true, quantity: true } } },
    });
    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "هذا المنتج غير متاح حالياً" }, { status: 404 });
    }

    // ⚠️ منتج له متغيرات لا يُضاف بدون اختيار أحدها (وإلا يُشترى بسعر ومخزون المنتج الأساسي)
    if (product.variants.length > 0 && !variantId) {
      return NextResponse.json({ error: "اختاري الخيار المطلوب قبل الإضافة للسلة" }, { status: 400 });
    }
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ error: "الخيار المحدَّد غير صالح لهذا المنتج" }, { status: 400 });
      }
      if (variant.quantity < 1) {
        return NextResponse.json({ error: "هذا الخيار غير متوفر حالياً" }, { status: 409 });
      }
    }

    // ⚠️ findUnique لا يقبل null لحقل ضمن @@unique مركّب (SQL لا يضمن
    // تفرّد NULL بقيود Unique) — يرفضه Prisma برسالة "must not be null"
    // بلا استثناء، بغض النظر عن أي إعداد. findFirst لا يحمل هذا القيد
    // لأنه استعلام WHERE عادي وليس بحث Unique مضمون التفرّد.
    const existing = variantId
      ? await prisma.cartItem.findUnique({
          where: { userId_productId_variantId: { userId: user.id, productId, variantId } },
        })
      : await prisma.cartItem.findFirst({
          where: { userId: user.id, productId, variantId: null },
        });

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.min(existing.quantity + quantity, 99) },
          select: CART_ITEM_SELECT,
        })
      : await prisma.cartItem.create({
          data: { userId: user.id, productId, variantId, quantity },
          select: CART_ITEM_SELECT,
        });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/cart]", err);
    return NextResponse.json({ error: "تعذّرت إضافة المنتج للسلة" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/cart]", err);
    return NextResponse.json({ error: "تعذّر إفراغ السلة" }, { status: 500 });
  }
}
