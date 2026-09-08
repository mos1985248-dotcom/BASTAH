// app/api/stores/shipping/[id]/route.ts
// ⚠️ إضافي بالكامل (موافَق عليه صراحةً) — يسمح للتاجر بتفعيل/تعطيل أو فصل
// ربط شركة شحن *بمتجره فقط*. لا يلمس أي بيانات اعتماد (credentialsEnc لا
// يُقرأ ولا يُعدَّل هنا إطلاقاً)، ولا "تفعيل/تعطيل Provider على مستوى
// المنصة" — ذاك حصراً عبر Registry (كودي)، هذا فقط تبديل isActive الخاص
// بربط هذا التاجر بالذات.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { z } from "zod";

interface Params {
  params: { id: string };
}

const toggleSchema = z.object({ isActive: z.boolean() });

async function assertOwnership(id: string, storeId: string) {
  const link = await prisma.storeShipping.findUnique({ where: { id } });
  if (!link || link.storeId !== storeId) return null;
  return link;
}

// PATCH — تفعيل/تعطيل الربط لهذا المتجر (لا تغيير على بيانات الاعتماد)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const link = await assertOwnership(params.id, storeId);
    if (!link) return NextResponse.json({ error: "الربط غير موجود أو لا يخص متجرك" }, { status: 404 });

    const parsed = toggleSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "قيمة isActive مطلوبة (true/false)" }, { status: 400 });

    const updated = await prisma.storeShipping.update({
      where: { id: params.id },
      data: { isActive: parsed.data.isActive },
      select: { id: true, carrier: true, isActive: true, connectedAt: true, lastTestedAt: true, lastTestOk: true },
    });
    return NextResponse.json({ record: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/stores/shipping/:id]", err);
    return NextResponse.json({ error: "تعذّر تحديث حالة الربط" }, { status: 500 });
  }
}

// DELETE — فصل شركة الشحن عن المتجر نهائياً (يحذف بيانات الاعتماد المشفَّرة معها)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const link = await assertOwnership(params.id, storeId);
    if (!link) return NextResponse.json({ error: "الربط غير موجود أو لا يخص متجرك" }, { status: 404 });

    await prisma.storeShipping.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/stores/shipping/:id]", err);
    return NextResponse.json({ error: "تعذّر فصل شركة الشحن" }, { status: 500 });
  }
}
