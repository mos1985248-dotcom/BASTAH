// app/api/admin/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { z } from "zod";

interface Params {
  params: { id: string };
}

const updateSchema = z.object({
  titleAr: z.string().trim().min(3).max(200).optional(),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/).optional(),
  excerptAr: z.string().trim().max(300).optional(),
  contentAr: z.string().trim().min(10).optional(),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  category: z.enum(["platform-news", "success-stories", "store-management", "crafts"]).optional(),
  tags: z.array(z.string().trim()).optional(),
  authorName: z.string().trim().max(100).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: "المقال غير موجود" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/blog/:id]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المقال" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    }

    if (parsed.data.slug) {
      const conflict = await prisma.blogPost.findFirst({ where: { slug: parsed.data.slug, id: { not: params.id } } });
      if (conflict) return NextResponse.json({ error: "هذا الـ slug مستخدم بمقال آخر" }, { status: 409 });
    }

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { isPublished: true, publishedAt: true } });
    if (!existing) return NextResponse.json({ error: "المقال غير موجود" }, { status: 404 });

    // أول مرة يُنشر فيها المقال، نسجّل publishedAt — بدون التأثير على تاريخ نشر أصلي لو كان منشوراً مسبقاً
    const justPublished = parsed.data.isPublished === true && !existing.isPublished;

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        coverImage: parsed.data.coverImage !== undefined ? parsed.data.coverImage || null : undefined,
        ...(justPublished ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/admin/blog/:id]", err);
    return NextResponse.json({ error: "تعذّر تحديث المقال" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    await prisma.blogPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/admin/blog/:id]", err);
    return NextResponse.json({ error: "تعذّر حذف المقال" }, { status: 500 });
  }
}
