// app/api/orders/route.ts
// قائمة الطلبات — افتراضياً طلبات المشتري نفسه. لو طلب seller view ولديه
// متجر فعّال، يشاهد طلبات متجره بدلاً منها (مسارين منطقيين بنفس endpoint
// بدل تكرار كود البحث/الـ pagination في ملفين).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { z } from "zod";

const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  view: z.enum(["buyer", "seller"]).default("buyer"),
  status: z
    .enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])
    .optional(),
});

const ORDER_LIST_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  total: true,
  createdAt: true,
  store: { select: { nameAr: true, slug: true, logo: true } },
  buyer: { select: { name: true } },
  items: { select: { nameAr: true, quantity: true }, take: 1 },
  _count: { select: { items: true } },
} as const;

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const parsed = queryParamsSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "معاملات بحث غير صالحة" }, { status: 400 });
    }
    const { page, limit, view, status } = parsed.data;

    let where: { buyerId?: string; storeId?: string; status?: typeof status } = {};

    if (view === "seller") {
      if (!user.store) {
        return NextResponse.json({ error: "لا يوجد متجر مرتبط بحسابك" }, { status: 403 });
      }
      where.storeId = user.store.id;
    } else {
      where.buyerId = user.id;
    }
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: ORDER_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب الطلبات" }, { status: 500 });
  }
}
