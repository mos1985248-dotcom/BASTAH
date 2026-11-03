// components/pricing/plan-types.ts
// يطابق حرفياً حقول SubscriptionPlanConfig التي يرجعها GET /api/subscription/plans.
// الحقول بعد featuresAr يرجعها الـAPI كلها (findMany بلا select) وتُستعمل في جدول المقارنة؛
// جُعلت اختيارية حتى لا يتأثر من يبني PlanConfig يدوياً (مثل بطاقات الرئيسية).

export interface PlanConfig {
  plan: "FREE" | "STARTER" | "GROWTH" | "PRO";
  nameAr: string;
  taglineAr: string | null;
  badgeAr: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxProducts: number | null;
  hasDaftari: boolean;
  hasAIFeatures: boolean;
  featuresAr: string[];
  maxOrders?: number | null;
  storageGB?: number;
  hasCustomDomain?: boolean;
  hasPaymentGateway?: boolean;
  hasRemoveBranding?: boolean;
  hasDiscountCodes?: boolean;
  hasFeaturedListing?: boolean;
  hasVerifiedBadge?: boolean;
  hasPrioritySearch?: boolean;
  reportsLevel?: "NONE" | "BASIC" | "MONTHLY" | "ADVANCED" | "FULL";
  hasChatSupport?: boolean;
  hasPrioritySupport?: boolean;
}
