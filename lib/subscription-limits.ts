import { getFeature, resolveFeature } from "./entitlements";
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
import type { Prisma, SubscriptionStatus } from "@prisma/client";

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
export async function assertCanAddProduct(storeId: string, db: Prisma.TransactionClient = prisma): Promise<void> {
  const feature = await resolveFeature(db, storeId, "products");
  if (!feature.allowed) throw new PlanLimitError("إضافة المنتجات غير متاحة لمتجرك.", false);
  const maxProducts = feature.limit;
  if (maxProducts === null) return;

  const currentCount = await db.product.count({
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
  const [products, munira, currentCount] = await Promise.all([
    getFeature(storeId, "products"),
    getFeature(storeId, "munira"),
    prisma.product.count({ where: { storeId, status: { not: "ARCHIVED" } } }),
  ]);
  return {
    planName: products.planName,
    currentCount,
    maxProducts: products.limit,
    isUnlimited: products.limit === null,
    percentUsed: products.limit ? Math.min(100, Math.round(currentCount / products.limit * 100)) : 0,
    hasMuniraAccess: munira.allowed,
    subscriptionStatus: products.active ? "ACTIVE" : "EXPIRED",
    isInGoodStanding: products.active,
  };
}

/**
 * بوّابة ميزات منيرة. حصة رسائل الدردشة منفصلة وتُحجز في قاعدة البيانات.
 */
export async function assertHasMuniraAccess(storeId: string): Promise<void> {
  if (!(await getFeature(storeId, "munira")).allowed) {
    throw new PlanLimitError("منيرة غير متاحة في باقتك الحالية.");
  }
}
