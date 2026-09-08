// app/api/admin/stores/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const { searchParams } = new URL(req.url);

    const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit  = Math.min(50, Number(searchParams.get("limit") ?? 20));
    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "";
    const plan   = searchParams.get("plan") ?? "";
    const verification = searchParams.get("verification") ?? "";

    const where: any = {};
    if (search)       where.OR = [{ nameAr: { contains: search, mode: "insensitive" } }, { user: { email: { contains: search, mode: "insensitive" } } }];
    if (status)       where.status = status;
    if (verification) where.verificationStatus = verification;
    if (plan)         where.subscription = { plan };

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          user:         { select: { id: true, name: true, email: true, phone: true } },
          subscription: { select: { plan: true, status: true, pricePerMonth: true, gracePeriodEndsAt: true } },
          _count:       { select: { products: true, orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.store.count({ where }),
    ]);

    return NextResponse.json({
      stores,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
