// app/api/admin/courier-shipments/route.ts — آخر شحنات مناديب بسطة (قراءة فقط، الإدارة)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const shipments = await prisma.shipment.findMany({
      where: { courierId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, status: true, createdAt: true,
        courier: { select: { name: true, city: true } },
        order: { select: { orderNumber: true, shippingCity: true, total: true, paymentMethod: true, store: { select: { nameAr: true } } } },
      },
    });
    return NextResponse.json({ shipments });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/courier-shipments]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
