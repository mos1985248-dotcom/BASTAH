// app/api/stores/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { createStoreSchema, listStoresQuerySchema, formatZodError } from "@/lib/validation";
import { calculateDistance, boundingBox } from "@/lib/geolocation";
import type { Prisma } from "@prisma/client";

function generateSlug(nameAr: string): string {
  const base = nameAr
    .trim()
    .replace(/\s+/g, "-")
    // نسمح بأحرف عربية وإنجليزية وأرقام وشرطة فقط في الـ slug
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "store"}-${suffix}`;
}

// ── GET /api/stores — قائمة عامة (لا تحتاج تسجيل دخول) ──
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = listStoresQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { page, limit, city, category, search, lat, lng, max_distance_km } = parsed.data;

  const where: Prisma.StoreWhereInput = {
    status: "ACTIVE", // المعلّق/قيد المراجعة لا يظهر للعامة أبداً
  };
  if (city) where.city = { equals: city, mode: "insensitive" };
  if (search) {
    where.OR = [
      { nameAr: { contains: search, mode: "insensitive" } },
      { nameEn: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.categories = { some: { category: { slug: category } } };
  }

  // ⚠️ Geolocation (اختياري تماماً) — يُفعَّل فقط لو أُرسلت الثلاثة معاً
  // (lat + lng + max_distance_km). أي طلب لا يرسلها يمشي بنفس المسار
  // القديم بالضبط (لا تغيير بالسلوك الافتراضي).
  const geoFilterActive = lat !== undefined && lng !== undefined && max_distance_km !== undefined;

  try {
    if (geoFilterActive) {
      const box = boundingBox(lat, lng, max_distance_km);
      const geoWhere: Prisma.StoreWhereInput = {
        ...where,
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLon, lte: box.maxLon },
      };

      // نجيب مرشّحين أكثر من صفحة واحدة (فلترة أولية بصندوق تقريبي)
      // ثم نحسب المسافة الدقيقة ونرتّب ونقسّم صفحات بكود التطبيق —
      // لا يوجد PostGIS بهذا المشروع لفلترة/ترتيب دقيق على مستوى الـDB.
      const candidates = await prisma.store.findMany({
        where: geoWhere,
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          logo: true,
          coverImage: true,
          shortDesc: true,
          city: true,
          isVerified: true,
          isFeatured: true,
          avgRating: true,
          totalReviews: true,
          totalProducts: true,
          subscription: { select: { plan: true, bankTransferEnabled: true } },
          latitude: true,
          longitude: true,
          pickupEnabled: true,
        },
        take: 500, // حد أعلى معقول لحماية الذاكرة — راجع نفس القرار بـ/api/stores/nearby
      });

      const withDistance = candidates
        .map((store) => ({
          ...store,
          distance_km:
            store.latitude != null && store.longitude != null
              ? calculateDistance(lat, lng, store.latitude, store.longitude)
              : null,
        }))
        .filter(
          (store): store is typeof store & { distance_km: number } =>
            store.distance_km !== null && store.distance_km <= max_distance_km
        )
        .sort((a, b) => a.distance_km - b.distance_km);

      const total = withDistance.length;
      const paged = withDistance
        .slice((page - 1) * limit, (page - 1) * limit + limit)
        // لا نرجّع الإحداثيات الخام — نفس قرار الخصوصية بـ/api/stores/nearby.
        // subscription (فيها الآن plan + bankTransferEnabled) تبقى متداخلة
        // — نفس نمط الفرع العادي أسفل، بدل تسطيح مكرّر
        .map(({ latitude, longitude, distance_km, ...rest }) => ({
          ...rest,
          distance_km: Math.round(distance_km * 10) / 10,
        }));

      return NextResponse.json({
        stores: paged,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          logo: true,
          coverImage: true,
          shortDesc: true,
          city: true,
          isVerified: true,
          isFeatured: true,
          avgRating: true,
          totalReviews: true,
          totalProducts: true,
          pickupEnabled: true,
          subscription: { select: { plan: true, bankTransferEnabled: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { totalOrders: "desc" }],
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
    console.error("[GET /api/stores]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المتاجر" }, { status: 500 });
  }
}

// ── POST /api/stores — إنشاء متجر (مستخدم مسجّل، متجر واحد لكل مستخدم) ──
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (user.role === "SELLER" && user.store) {
      return NextResponse.json({ error: "لديك متجر بالفعل" }, { status: 409 });
    }
    if (!["BUYER", "SELLER"].includes(user.role)) {
      return NextResponse.json({ error: "لا يمكن لهذا النوع من الحسابات إنشاء متجر" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createStoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { categoryIds, ...storeData } = parsed.data;

    if (storeData.pickupEnabled === true && (storeData.latitude == null || storeData.longitude == null)) {
      return NextResponse.json(
        { error: "لازم تحددي موقع متجرك (latitude/longitude) قبل تفعيل الاستلام من الموقع" },
        { status: 422 }
      );
    }

    const originalPlan = await prisma.subscriptionPlanConfig.findUnique({
      where: { plan: "FREE" },
      select: { priceMonthly: true },
    });

    // إعادة محاولة لو تعارض الـ slug (نادر جداً لكن ممكن نظرياً)
    for (let attempt = 0; attempt < 3; attempt++) {
      const slug = generateSlug(storeData.nameAr);
      try {
        const store = await prisma.$transaction(async (tx) => {
          const newStore = await tx.store.create({
            data: {
              userId: user.id,
              slug,
              ...storeData,
              subscription: {
                create: {
                  plan: "FREE",
                  status: "ACTIVE",
                  pricePerMonth: originalPlan?.priceMonthly ?? 0,
                },
              },
              publicInfo: { create: {} },
              ...(categoryIds?.length
                ? { categories: { create: categoryIds.map((categoryId) => ({ categoryId })) } }
                : {}),
            },
            select: { id: true, nameAr: true, slug: true, status: true },
          });

          if (user.role !== "SELLER") {
            await tx.user.update({ where: { id: user.id }, data: { role: "SELLER" } });
          }

          return newStore;
        });

        return NextResponse.json({ store }, { status: 201 });
      } catch (err: any) {
        if (err?.code === "P2002" && err?.meta?.target?.includes("slug")) {
          continue; // تعارض slug — حاولي بمعرّف عشوائي جديد
        }
        throw err;
      }
    }

    return NextResponse.json({ error: "تعذّر إنشاء رابط فريد للمتجر، حاولي مجدداً" }, { status: 500 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/stores]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
