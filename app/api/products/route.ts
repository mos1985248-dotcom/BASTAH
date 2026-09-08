// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    store: {
      status: "ACTIVE",
      subscription: { status: { in: GOOD_STANDING_STATUSES } },
    },
  };
  if (storeId) where.storeId = storeId;
  if (category) where.category = { slug: category };
  if (city) {
    where.store = {
      ...where.store,
      city: city,
    };
  }
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

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }  catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المنتجات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    await assertCanAddProduct(storeId);

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const baseSlug = data.nameAr.trim().replace(/\s+/g, "-").slice(0, 60);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    const [product] = await prisma.$transaction([
      prisma.product.create({
        data: { ...data, storeId, slug },
        select: { id: true, nameAr: true, slug: true, status: true, price: true },
      }),
      prisma.store.update({ where: { id: storeId }, data: { totalProducts: { increment: 1 } } }),
    ]);

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