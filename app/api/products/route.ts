import { assertStoreFeature } from "@/lib/feature-access";
// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pricingRecord, productPricingSchema } from "@/lib/pricing/storage";
import { requireActiveStore, requireUser, AuthError } from "@/lib/auth";
import { assertCanAddProduct, PlanLimitError, GOOD_STANDING_STATUSES } from "@/lib/subscription-limits";
import { createProductSchema, listProductsQuerySchema, formatZodError } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  popular: { totalSold: "desc" },
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  rating: { avgRating: "desc" },
};

// ── GET /api/products — قائمة عامة، أو "view=seller" لمتجر التاجر نفسه ──
// view=seller يتجاوز فلتر status=ACTIVE العام لأن التاجر يحتاج رؤية
// مسوّداته ومنتجاته المؤرشفة أيضاً — وليس فقط ما يراه المشتري.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");

  if (view === "seller") {
    try {
      const user = await requireUser();
      if (!user.store) {
        return NextResponse.json({ error: "لا يوجد متجر مرتبط بحسابك" }, { status: 403 });
      }
      const products = await prisma.product.findMany({
        where: { storeId: user.store.id },
        select: {
          id: true, nameAr: true, slug: true, mainImage: true, price: true,
          quantity: true, status: true, totalSold: true, createdAt: true,
          variants: { select: { id: true, nameAr: true, quantity: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ products });
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[GET /api/products?view=seller]", err);
      return NextResponse.json({ error: "حدث خطأ في جلب منتجاتك" }, { status: 500 });
    }
  }

  const parsed = listProductsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { page, limit, storeId, category, city, search, minPrice, maxPrice, sort } = parsed.data;

  // ⚠️ فلتر متجر منفصل بنوع صريح — تعديله تدريجياً (city لاحقاً) بدل
  // تضمينه مباشرة داخل where وتعديله بالسبريد (...where.store) كان يُربك
  // استدلال TypeScript لنوع الحقل الجديد المُضاف (city) ويُرجعه undefined
  const storeFilter: Prisma.StoreWhereInput = {
    status: "ACTIVE", // لا نُظهر منتجات متجر معلّق إدارياً حتى لو المنتج نفسه ACTIVE
    subscription: { status: { in: GOOD_STANDING_STATUSES } }, // ولا منتجات اشتراك منتهي/معلّق عن الدفع
  };
  if (city) storeFilter.city = { equals: city, mode: "insensitive" };

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    store: storeFilter,
  };
  if (storeId) where.storeId = storeId;
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { nameAr: { contains: search, mode: "insensitive" } },
      { nameEn: { contains: search, mode: "insensitive" } },
    ];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          mainImage: true,
          price: true,
          comparePrice: true,
          avgRating: true,
          totalReviews: true,
          totalSold: true,
          isHandmade: true,
          quantity: true,
          store: { select: { id: true, nameAr: true, slug: true, city: true } },
        },
        orderBy: SORT_MAP[sort],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Only cache the anonymous first page of the unfiltered public catalog.
    // Keep browser caching disabled so it can see updates once the edge entry expires.
    const cacheable = page === 1 && !storeId && !category && !city && !search &&
      minPrice === undefined && maxPrice === undefined && !view &&
      !req.headers.has("cookie") && !req.headers.has("authorization");
    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, {
      headers: cacheable
        ? { "Cache-Control": "public, max-age=0, must-revalidate", "Vercel-CDN-Cache-Control": "public, s-maxage=15" }
        : { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المنتجات" }, { status: 500 });
  }
}

// ── POST /api/products — إضافة منتج (يتحقق من حد الباقة) ──
export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();

    const body = await req.json();
    const pricing = productPricingSchema.optional().safeParse(body?.pricing);
    if (!pricing.success) {
      return NextResponse.json({ error: formatZodError(pricing.error) }, { status: 400 });
    }
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;
    if (pricing.data) await assertStoreFeature(storeId, "pricing");
    const record = pricing.data ? pricingRecord(pricing.data) : undefined;

    const baseSlug = data.nameAr.trim().replace(/\s+/g, "-").slice(0, 60);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    const product = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM stores WHERE id = ${storeId} FOR UPDATE`;
      await assertCanAddProduct(storeId, tx);
      const created = await tx.product.create({
        data: { ...data, storeId, slug, ...(record && { pricing: { create: record } }) },
        select: { id: true, nameAr: true, slug: true, status: true, price: true },
      });
      await tx.store.update({ where: { id: storeId }, data: { totalProducts: { increment: 1 } } });
      return created;
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof PlanLimitError) {
      return NextResponse.json(
        { error: err.message, upgradeRequired: err.upgradeRequired },
        { status: 403 }
      );
    }
    console.error("[POST /api/products]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
