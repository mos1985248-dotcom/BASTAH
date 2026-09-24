// app/api/admin/couriers/route.ts
// مناديب المدن (بسطة للشحن) — الإدارة فقط. تفعيل/تعطيل بدل الحذف للحفاظ على سجل الشحنات.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { createCityCourierSchema, formatZodError } from "@/lib/validation";
import { logAudit, getClientIp } from "@/lib/audit-log";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const couriers = await prisma.cityCourier.findMany({
      select: { id: true, city: true, name: true, phone: true, isActive: true, createdAt: true, _count: { select: { shipments: true } } },
      orderBy: [{ city: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ couriers: couriers.map(({ _count, ...c }) => ({ ...c, shipmentsCount: _count.shipments })) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/couriers]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = createCityCourierSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const courier = await prisma.cityCourier.create({
      data: parsed.data,
      select: { id: true, city: true, name: true, phone: true, isActive: true, createdAt: true },
    });
    await logAudit({
      actorId: admin.id, action: "SHIPPING_PROVIDER_ADDED", targetType: "CityCourier", targetId: courier.id,
      metadata: { event: "city_courier_created", city: courier.city }, ipAddress: getClientIp(req.headers),
    });
    return NextResponse.json({ courier }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/admin/couriers]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
