// app/api/admin/couriers/[id]/route.ts — تفعيل/تعطيل مندوب (الإدارة فقط)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { updateCityCourierSchema, formatZodError } from "@/lib/validation";
import { logAudit, getClientIp } from "@/lib/audit-log";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = updateCityCourierSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const existing = await prisma.cityCourier.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "المندوب غير موجود" }, { status: 404 });

    const courier = await prisma.cityCourier.update({
      where: { id: params.id },
      data: { isActive: parsed.data.isActive },
      select: { id: true, isActive: true },
    });
    await logAudit({
      actorId: admin.id, action: "SHIPPING_PROVIDER_ADDED", targetType: "CityCourier", targetId: courier.id,
      metadata: { event: courier.isActive ? "city_courier_enabled" : "city_courier_disabled" }, ipAddress: getClientIp(req.headers),
    });
    return NextResponse.json({ courier });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/admin/couriers/[id]]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
