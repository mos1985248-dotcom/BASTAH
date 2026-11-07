// app/blog/[slug]/page.tsx
// Server Component — مسؤول فقط عن generateMetadata (SEO/OpenGraph حقيقي لكل
// مقال) ثم يعرض BlogPostClient الذي يحمل نفس منطق الجلب والعرض السابق
// بدون أي تغيير. هذا النمط القياسي بـ Next.js App Router لدمج SEO ديناميكي
// مع صفحات تعتمد client-side fetching.

import type { Metadata } from "next";
import { formatPlatformCopy } from "@/lib/brand";
import { prisma } from "@/lib/prisma";
import BlogPostClient from "@/components/blog/BlogPostClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: { titleAr: true, excerptAr: true, coverImage: true, isPublished: true },
  });

  if (!post || !post.isPublished) {
    return { title: "المقال غير موجود | بسطة مارت" };
  }

  const description = formatPlatformCopy(post.excerptAr ?? "مقال من مدونة بسطة مارت — منصة الأسر المنتجة السعودية");

  return {
    title: `${formatPlatformCopy(post.titleAr)} | مدونة بسطة مارت`,
    description,
    openGraph: {
      siteName: "بسطة مارت",
      title: formatPlatformCopy(post.titleAr),
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
      type: "article",
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  return <BlogPostClient slug={params.slug} />;
}
