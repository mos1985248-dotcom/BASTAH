// app/api/admin/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  titleAr: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/, "Slug يجب أن يحتوي أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  excerptAr: z.string().trim().max(300).optional(),
  contentAr: z.string().trim().min(10),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  category: z.enum(["platform-news", "success-stories", "store-management", "crafts"]),
  tags: z.array(z.string().trim()).default([]),
  authorName: z.string().trim().max(100).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, titleAr: true, slug: true, category: true, isPublished: true, isFeatured: true, viewCount: true, publishedAt: true, createdAt: true },
      }),
      prisma.blogPost.count(),
    ]);

    return NextResponse.json({ posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/blog]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المقالات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return NextResponse.json({ error: "هذا الـ slug مستخدم مسبقاً" }, { status: 409 });

    const post = await prisma.blogPost.create({
      data: {
        ...parsed.data,
        coverImage: parsed.data.coverImage || null,
        authorId: admin.id,
        authorName: parsed.data.authorName || admin.name,
        publishedAt: parsed.data.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/admin/blog]", err);
    return NextResponse.json({ error: "تعذّر إنشاء المقال" }, { status: 500 });
  }
}
