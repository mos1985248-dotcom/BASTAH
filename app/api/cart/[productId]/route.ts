// app/api/cart/[productId]/route.ts
// ⚠️ variantId اختياري الآن (body لـPATCH، query string لـDELETE) — منتج
// بدون متغيّرات يبقى يعمل تماماً كالسابق بدون تمريره (يُطابق NULL تلقائياً).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { z } from "zod";

interface Params {
  params: { productId: string };
}

const updateSchema = z.object({
  quantity: z.coerce.number().int().positive().max(99),
  variantId: z.string().cuid().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "كمية غير صالحة" }, { status: 400 });

    const result = await prisma.cartItem.updateMany({
      where: { userId: user.id, productId: params.productId, variantId: parsed.data.variantId ?? null },
      data: { quantity: parsed.data.quantity },
    });
    if (result.count === 0) return NextResponse.json({ error: "المنتج غير موجود بسلتك" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/cart/:productId]", err);
    return NextResponse.json({ error: "تعذّر تحديث الكمية" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const variantId = req.nextUrl.searchParams.get("variantId");
    await prisma.cartItem.deleteMany({ where: { userId: user.id, productId: params.productId, variantId: variantId ?? null } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/cart/:productId]", err);
    return NextResponse.json({ error: "تعذّر حذف المنتج من السلة" }, { status: 500 });
  }
}
