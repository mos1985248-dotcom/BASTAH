// app/api/admin/couriers/[id]/statement/route.ts
// كشف حساب مندوب — كل شحناته وحالتها والمبلغ المستحق له. الإدارة فقط.
// ⚠️ العمولة تُحتسب فقط للشحنات "تم تسليمها" فعلاً (DELIVERED)، لا كل
// شحنة أُسندت له — حتى لا يُحتسب مبلغ لشحنة فشلت أو أُعيدت.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const courier = await prisma.cityCourier.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, city: true, phone: true, commissionPerShipment: true },
    });
    if (!courier) return NextResponse.json({ error: "المندوب غير موجود" }, { status: 404 });

    const shipments = await prisma.shipment.findMany({
      where: { courierId: courier.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, status: true, createdAt: true, deliveredAt: true,
        order: { select: { orderNumber: true, shippingCity: true, store: { select: { nameAr: true } } } },
      },
    });

    const rate = courier.commissionPerShipment ?? 0;
    const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
    const totalOwed = deliveredCount * rate;

    const rows = shipments.map((s) => ({
      id: s.id,
      orderNumber: s.order.orderNumber,
      storeName: s.order.store.nameAr,
      city: s.order.shippingCity,
      status: s.status,
      createdAt: s.createdAt,
      deliveredAt: s.deliveredAt,
      commission: s.status === "DELIVERED" ? rate : 0,
    }));

    return NextResponse.json({
      courier,
      summary: { shipmentsCount: shipments.length, deliveredCount, rate, totalOwed },
      shipments: rows,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/couriers/[id]/statement]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
