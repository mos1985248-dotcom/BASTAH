import { assertStoreFeature } from "@/lib/feature-access";
// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pricingRecord, productPricingSchema } from "@/lib/pricing/storage";
import { requireUser, getCurrentUser, AuthError } from "@/lib/auth";
import { updateProductSchema, formatZodError } from "@/lib/validation";
import { isSubscriptionInGoodStanding } from "@/lib/subscription-limits";
import { readUtmFromUrl, persistAttributionCookie, recordEvent } from "@/lib/analytics";

interface Params {
  params: { id: string };
}

// ── GET /api/products/[id] — تفاصيل المنتج ──────────────
// عام للزائر، لكن لو اشتراك المتجر غير سليم (معلّق/منتهي) يُخفى المنتج
// تماماً عن أي زائر — إلا عن مالك المتجر نفسه أو الإدارة، اللذان يحتاجان
// رؤيته لإدارته أو معرفة سبب اختفائه (مع تنبيه subscriptionWarning).
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        store: {
          select: {
            id: true, nameAr: true, slug: true, city: true, whatsapp: true, isVerified: true,
            logo: true, avgRating: true, totalReviews: true, totalFollowers: true,
            userId: true,
            publicInfo: true,
            subscription: { select: { status: true } },
          },
        },
        category: { select: { nameAr: true, slug: true } },
        variants: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
        productImages: { orderBy: { position: "asc" } },
      },
    });

    if (!product || product.status === "ARCHIVED") {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwnerOrAdmin =
      !!currentUser &&
      (currentUser.id === product.store.userId ||
        currentUser.role === "ADMIN" ||
        currentUser.role === "SUPER_ADMIN");

    const subscriptionOk = product.store.subscription
      ? isSubscriptionInGoodStanding(product.store.subscription.status)
      : false;

    if (!subscriptionOk && !isOwnerOrAdmin) {
      // نُخفي المنتج كأنه غير موجود تماماً — لا نكشف سبب الاختفاء لزائر عادي
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // ⚠️ إضافي — isFollowing يُحسب حياً (لا عمود مخزَّن)، بدون أي endpoint جديد
    let isFollowing: boolean | undefined;
    if (currentUser) {
      const follow = await prisma.storeFollower.findUnique({
        where: { storeId_userId: { storeId: product.store.id, userId: currentUser.id } },
        select: { id: true },
      });
      isFollowing = !!follow;
    }

    // لا نُسرّب userId للاستجابة العامة — كان مطلوباً فقط للتحقق أعلاه
    const { userId: _omit, subscription, ...storePublic } = product.store;
    const { costPrice: _privateCost, ...publicProduct } = product;
    const responseProduct = {
      ...publicProduct,
      store: { ...storePublic, isFollowing },
      ...(isOwnerOrAdmin && !subscriptionOk
        ? { subscriptionWarning: "اشتراك متجرك غير فعّال حالياً — هذا المنتج مخفي عن الزوّار حتى تجديد الباقة" }
        : {}),
    };

    // عدّاد مشاهدات تقريبي — لا يحتاج دقة معاملاتية، increment بسيط يكفي
    await prisma.product.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    // ⚠️ تحليلات التسويق: وسم utm (إن وُجد برابط الزيارة) + حدث PRODUCT_VIEW.
    // كوكي الإسناد أول لمسة فقط — راجع persistAttributionCookie بـlib/analytics.ts
    const utm = readUtmFromUrl(req.url);
    const res = NextResponse.json({ product: responseProduct });
    persistAttributionCookie(req, res, utm, product.id);
    await recordEvent({ type: "PRODUCT_VIEW", storeId: product.store.id, productId: product.id, ...utm });
    return res;
  } catch (err) {
    console.error("[GET /api/products/:id]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب المنتج" }, { status: 500 });
  }
}

async function assertOwnership(productId: string, userId: string, userRole: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, storeId: true, store: { select: { userId: true } } },
  });
  if (!product) return { product: null, allowed: false };
  const allowed = product.store.userId === userId || userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  return { product, allowed };
}

// ── PATCH /api/products/[id] — تعديل (مالك المتجر فقط) ──
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { product, allowed } = await assertOwnership(params.id, user.id, user.role);
    if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    if (!allowed) return NextResponse.json({ error: "لا تملكين صلاحية تعديل هذا المنتج" }, { status: 403 });

    const body = await req.json();
    const pricing = productPricingSchema.optional().safeParse(body?.pricing);
    if (!pricing.success) {
      return NextResponse.json({ error: formatZodError(pricing.error) }, { status: 400 });
    }
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    if (pricing.data && (user.role !== "SELLER" || user.store?.id !== product.storeId)) {
      return NextResponse.json({ error: "بيانات التسعير متاحة للتاجر مالك المنتج فقط" }, { status: 403 });
    }
    if (pricing.data) await assertStoreFeature(product.storeId, "pricing");
    const record = pricing.data ? pricingRecord(pricing.data) : undefined;

    // ⚠️ منتج له متغيرات: كميته = مجموع كميات متغيراته ويُديرها /variants فقط — نتجاهل quantity هنا
    const data = { ...parsed.data };
    if (data.storeSectionId && !(await prisma.storeSection.findUnique({
      where: { storeId_id: { storeId: product.storeId, id: data.storeSectionId } }, select: { id: true },
    }))) {
      return NextResponse.json({ error: "قسم المتجر غير متاح" }, { status: 400 });
    }
    if (data.quantity !== undefined && (await prisma.productVariant.count({ where: { productId: params.id } })) > 0) {
      delete data.quantity;
    }

    const updated = await prisma.product.update({
      where: record ? { id: params.id, storeId: product.storeId, store: { userId: user.id } } : { id: params.id },
      data: { ...data, ...(record && { pricing: { upsert: { create: record, update: record } } }) },
      select: { id: true, nameAr: true, slug: true, status: true, price: true, quantity: true },
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[PATCH /api/products/:id]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── DELETE /api/products/[id] — أرشفة، وليس حذف فعلي ────
// قرار مقصود: لا نحذف صفوف المنتج من القاعدة أبداً. حتى لو لم يُطلَب
// المنتج بعد، الأرشفة (status=ARCHIVED) أبسط، قابلة للتراجع، ولا تخاطر
// بكسر أي مرجع مستقبلي (مراجعات، مفضلة، إحصائيات تاريخية).
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { product, allowed } = await assertOwnership(params.id, user.id, user.role);
    if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    if (!allowed) return NextResponse.json({ error: "لا تملكين صلاحية حذف هذا المنتج" }, { status: 403 });

    await prisma.$transaction([
      prisma.product.update({ where: { id: params.id }, data: { status: "ARCHIVED" } }),
      prisma.store.update({
        where: { id: product.storeId },
        data: { totalProducts: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[DELETE /api/products/:id]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
