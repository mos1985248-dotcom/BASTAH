// app/api/blog/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي فقط، لا يمس أي route موجود) — يقرأ من
// موديل BlogPost الموجود أصلاً بالـ schema والذي لم يكن له أي route عام.
// عام بدون مصادقة، قراءة فقط، بدون أي business logic جديدة.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().trim().optional(),
});

const POST_LIST_SELECT = {
  id: true,
  titleAr: true,
  slug: true,
  excerptAr: true,
  coverImage: true,
  category: true,
  authorName: true,
  authorAvatar: true,
  publishedAt: true,
  viewCount: true,
} as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = queryParamsSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "معاملات بحث غير صالحة" }, { status: 400 });
    }
    const { page, limit, category } = parsed.data;

    const where = { isPublished: true, ...(category ? { category } : {}) };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: POST_LIST_SELECT,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/blog]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المقالات" }, { status: 500 });
  }
}
