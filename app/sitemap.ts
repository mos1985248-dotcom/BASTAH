// app/sitemap.ts
// Next.js يخدم هذا تلقائياً على /sitemap.xml — يقرأ بيانات حقيقية فقط
// (مقالات منشورة، متاجر ومنتجات نشطة)، بدون أي رابط وهمي.
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// ⚠️ يقرأ نفس المتغيّر الموجود مسبقاً بـ.env.example — ما أضفت متغيّر جديد
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://basita.sa";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/marketplace`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/offers`, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [posts, stores, products] = await Promise.all([
    prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.store.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true }, take: 2000 }),
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { id: true, updatedAt: true }, take: 5000, orderBy: { updatedAt: "desc" } }),
  ]);

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const storeRoutes: MetadataRoute.Sitemap = stores.map((s) => ({
    url: `${BASE_URL}/store/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes, ...storeRoutes, ...productRoutes];
}
