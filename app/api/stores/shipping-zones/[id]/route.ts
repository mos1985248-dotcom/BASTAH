// app/api/stores/shipping-zones/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { updateShippingZoneSchema, formatZodError } from "@/lib/validation";

interface Params {
  params: { id: string };
}

async function assertOwnership(id: string, storeId: string) {
  const zone = await prisma.shippingZone.findUnique({ where: { id } });
  if (!zone || zone.storeId !== storeId) return null;
  return zone;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const zone = await assertOwnership(params.id, storeId);
    if (!zone) return NextResponse.json({ error: "المنطقة غير موجودة أو لا تخص متجرك" }, { status: 404 });

    const parsed = updateShippingZoneSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const updated = await prisma.shippingZone.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ zone: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/stores/shipping-zones/:id]", err);
    return NextResponse.json({ error: "تعذّر تحديث المنطقة" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const zone = await assertOwnership(params.id, storeId);
    if (!zone) return NextResponse.json({ error: "المنطقة غير موجودة أو لا تخص متجرك" }, { status: 404 });

    await prisma.shippingZone.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/stores/shipping-zones/:id]", err);
    return NextResponse.json({ error: "تعذّر حذف المنطقة" }, { status: 500 });
  }
}
