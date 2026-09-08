// app/api/stores/[slug]/reviews/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي فقط) — يستخدم موديل Review الموجود
// أصلاً بالـ schema (بدون أي route عام سابق يُرجع القائمة أو التوزيع).
// يُرجع فقط المراجعات المعتمدة (status = APPROVED) — لا بيانات ملفّقة.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { slug: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      select: { id: true, avgRating: true, totalReviews: true },
    });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 6));

    const where = { storeId: store.id, status: "APPROVED" as const };

    const [reviews, total, distributionRaw] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          sellerReply: true,
          createdAt: true,
          user: { select: { name: true, avatar: true } },
          product: { select: { nameAr: true } },
        },
      }),
      prisma.review.count({ where }),
      prisma.review.groupBy({ by: ["rating"], where, _count: { rating: true } }),
    ]);

    const distribution: Record<"5" | "4" | "3" | "2" | "1", number> = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
    for (const row of distributionRaw) {
      const key = String(row.rating) as keyof typeof distribution;
      if (key in distribution) distribution[key] = row._count.rating;
    }

    return NextResponse.json({
      reviews,
      total,
      page,
      limit,
      distribution,
      avgRating: store.avgRating,
      totalReviews: store.totalReviews,
    });
  } catch (err) {
    console.error("[GET /api/stores/:slug/reviews]", err);
    return NextResponse.json({ error: "تعذّر جلب المراجعات" }, { status: 500 });
  }
}
