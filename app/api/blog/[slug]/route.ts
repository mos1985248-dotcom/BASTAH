// app/api/blog/[slug]/route.ts
// ⚠️ إضافي فقط — قراءة مقال واحد بالـ slug، بدون أي تعديل (لا حتى زيادة
// viewCount) حتى تبقى العملية read-only بالكامل بدون أي أثر جانبي.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { slug: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: {
        id: true, titleAr: true, slug: true, excerptAr: true, contentAr: true,
        coverImage: true, category: true, tags: true, authorName: true,
        authorAvatar: true, publishedAt: true, isPublished: true, viewCount: true,
      },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json({ error: "المقال غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("[GET /api/blog/:slug]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المقال" }, { status: 500 });
  }
}
