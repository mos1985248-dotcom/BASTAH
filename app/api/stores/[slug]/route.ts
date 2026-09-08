// app/api/stores/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, getCurrentUser, AuthError } from "@/lib/auth";
import { updateStoreSchema, formatZodError } from "@/lib/validation";

interface Params {
  params: { slug: string };
}

// ── GET /api/stores/[slug] — صفحة المتجر العامة ─────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        userId: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        description: true,
        shortDesc: true,
        logo: true,
        coverImage: true,
        bannerImages: true,
        whatsapp: true,
        instagram: true,
        city: true,
        region: true,
        status: true,
        isVerified: true,
        isFeatured: true,
        avgRating: true,
        totalReviews: true,
        totalProducts: true,
        totalOrders: true,
        totalFollowers: true,
        createdAt: true,
        publicInfo: true,
        pickupEnabled: true,
        latitude: true,
        longitude: true,
        subscription: { select: { plan: true, status: true, bankTransferEnabled: true } },
      },
    });

    if (!store || store.status !== "ACTIVE") {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    // ⚠️ إضافي — isFollowing يُحسب حياً (لا عمود مخزَّن)، بدون تأثير على
    // شكل الاستجابة الأساسي لو المستخدم زائر غير مسجّل (undefined فقط).
    let isFollowing: boolean | undefined;
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const follow = await prisma.storeFollower.findUnique({
        where: { storeId_userId: { storeId: store.id, userId: currentUser.id } },
        select: { id: true },
      });
      isFollowing = !!follow;
    }

    // ⚠️ الإحداثيات الخام (latitude/longitude) تظهر فقط لمالك المتجر أو
    // الإدارة — نفس قرار الخصوصية بـ/api/stores/nearby (لا تُعرض للعامة).
    // المالك يحتاجها لتعبئة نموذج التعديل بلوحته (يستخدم هذا المسار نفسه).
    const isOwnerOrAdmin =
      currentUser?.id === store.userId || currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
    const { userId: _ownerId, latitude, longitude, ...storePublic } = store;

    return NextResponse.json({
      store: { ...storePublic, isFollowing, ...(isOwnerOrAdmin ? { latitude, longitude } : {}) },
    });
  } catch (err) {
    console.error("[GET /api/stores/:slug]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المتجر" }, { status: 500 });
  }
}

// ── PATCH /api/stores/[slug] — تعديل (المالك فقط) ───────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();

    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      select: { id: true, userId: true },
    });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    if (store.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "لا تملكين صلاحية تعديل هذا المتجر" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateStoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { categoryIds, ...updateData } = parsed.data;

    // ⚠️ لا فائدة من "استلام من الموقع" بدون إحداثيات فعلية تُعرض
    // للمشتري — نتحقق من وجودها إما بنفس الطلب أو مسبقاً بقاعدة البيانات
    if (updateData.pickupEnabled === true) {
      const hasCoordsInRequest = updateData.latitude != null && updateData.longitude != null;
      if (!hasCoordsInRequest) {
        const current = await prisma.store.findUnique({
          where: { id: store.id },
          select: { latitude: true, longitude: true },
        });
        if (current?.latitude == null || current?.longitude == null) {
          return NextResponse.json(
            { error: "لازم تحددي موقع متجرك (latitude/longitude) قبل تفعيل الاستلام من الموقع" },
            { status: 422 }
          );
        }
      }
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        ...updateData,
        ...(categoryIds
          ? {
              categories: {
                deleteMany: {}, // نستبدل التصنيفات بالكامل بدل الدمج — أبسط وأقل عرضة لتكرار
                create: categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : {}),
      },
      select: { id: true, nameAr: true, slug: true, status: true },
    });

    return NextResponse.json({ store: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[PATCH /api/stores/:slug]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
