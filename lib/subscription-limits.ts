// lib/subscription-limits.ts
// التحقق من حدود الباقة قبل أي عملية مقيَّدة (إضافة منتج، الوصول لمنيرة، ...).
//
// قرار تصميم: الحدود تُقرأ من جدول SubscriptionPlanConfig (مصدر حقيقة واحد)
// بدل تكرارها كأرقام ثابتة (hardcoded) في كل route — لو غيّر الأدمن حدود
// باقة "بسطة نمو" من 20 إلى 25 منتج، يكفي تعديل صف واحد في القاعدة.
//
// ⚠️ لا توجد أي منطقة عمولة هنا إطلاقاً — نموذج الإيراد الآن رسوم اشتراك
// فقط. كل ما تتحقق منه هذه الملف هو: حدود المنتجات + الوصول لمنيرة AI +
// "هل الاشتراك في وضع صحي (paid/good standing) أم لا".

import { prisma } from "./prisma";
import type { SubscriptionStatus } from "@prisma/client";

export class PlanLimitError extends Error {
  constructor(message: string, public upgradeRequired = true) {
    super(message);
    this.name = "PlanLimitError";
  }
}

// حالات اشتراك "سليمة" — المتجر ومنتجاته ظاهرة للعامة، ويمكن إضافة منتجات
export const GOOD_STANDING_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIAL", "GRACE_PERIOD"];
const GOOD_STANDING: ReadonlySet<SubscriptionStatus> = new Set(GOOD_STANDING_STATUSES);

/**
 * يُستخدم في كل مكان يحتاج معرفة "هل هذا الاشتراك سليم؟" — بما فيها فلاتر
 * عرض المنتجات للعامة (GET /api/products) وفحص الإضافة (assertCanAddProduct).
 * SUSPENDED / CANCELLED / EXPIRED = غير سليم → يخفي المنتجات حتى التجديد.
 */
export function isSubscriptionInGoodStanding(status: SubscriptionStatus): boolean {
  return GOOD_STANDING.has(status);
}

/** يتحقق أن المتجر يستطيع إضافة منتج جديد حسب باقته الحالية */
export async function assertCanAddProduct(storeId: string): Promise<void> {
  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId },
  });

  if (!subscription) {
    throw new PlanLimitError("لا يوجد اشتراك فعّال لهذا المتجر");
  }

  if (!isSubscriptionInGoodStanding(subscription.status)) {
    throw new PlanLimitError(
      "اشتراكك غير فعّال حالياً (معلّق/منتهي) — جدّدي الباقة لاستعادة إضافة المنتجات",
      false
    );
  }

  // حد مخصّص يدوياً من الأدمن يتجاوز حد الباقة الافتراضي
  const maxProducts =
    subscription.customMaxProducts ??
    (
      await prisma.subscriptionPlanConfig.findUnique({
        where: { plan: subscription.plan },
        select: { maxProducts: true },
      })
    )?.maxProducts;

  if (maxProducts === null || maxProducts === undefined) {
    return; // null = غير محدود (باقة برو)
  }

  const currentCount = await prisma.product.count({
    where: { storeId, status: { not: "ARCHIVED" } },
  });

  if (currentCount >= maxProducts) {
    throw new PlanLimitError(
      `وصلتِ للحد الأقصى (${maxProducts} منتج) في باقتك الحالية. رقّي باقتك لإضافة المزيد.`
    );
  }
}

/** يرجع معلومات الاستخدام الحالي (لعرضها في شريط تقدّم بلوحة التاجر) */
export async function getProductUsage(storeId: string) {
  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId },
  });
  if (!subscription) return null;

  const planConfig = await prisma.subscriptionPlanConfig.findUnique({
    where: { plan: subscription.plan },
    select: { maxProducts: true, nameAr: true, hasAIFeatures: true },
  });

  const currentCount = await prisma.product.count({
    where: { storeId, status: { not: "ARCHIVED" } },
  });

  const maxProducts = subscription.customMaxProducts ?? planConfig?.maxProducts ?? null;

  return {
    planName: planConfig?.nameAr ?? subscription.plan,
    currentCount,
    maxProducts, // null = غير محدود
    isUnlimited: maxProducts === null,
    percentUsed: maxProducts ? Math.min(100, Math.round((currentCount / maxProducts) * 100)) : 0,
    hasMuniraAccess: planConfig?.hasAIFeatures ?? false,
    subscriptionStatus: subscription.status,
    isInGoodStanding: isSubscriptionInGoodStanding(subscription.status),
  };
}

/**
 * بوّابة الوصول لمنيرة AI — FREE و STARTER ممنوعتان، GROWTH و PRO مسموح.
 * لا يوجد API حقيقي لمنيرة في هذا المشروع بعد (راجع ملاحظة في نهاية
 * README) — هذه الدالة جاهزة لاستدعائها فور بناء أول route حقيقي لها.
 */
export async function assertHasMuniraAccess(storeId: string): Promise<void> {
  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId },
    select: { plan: true, status: true },
  });
  if (!subscription) {
    throw new PlanLimitError("لا يوجد اشتراك فعّال لهذا المتجر");
  }
  if (!isSubscriptionInGoodStanding(subscription.status)) {
    throw new PlanLimitError("اشتراكك غير فعّال حالياً — جدّدي الباقة لاستخدام منيرة", false);
  }

  const planConfig = await prisma.subscriptionPlanConfig.findUnique({
    where: { plan: subscription.plan },
    select: { hasAIFeatures: true },
  });

  if (!planConfig?.hasAIFeatures) {
    throw new PlanLimitError(
      "منيرة غير متاحة في باقتك الحالية — رقّي لباقة بسطة انطلاق أو بسطة ازدهار لتفعيلها"
    );
  }
}
