// components/pricing/plan-types.ts
// يطابق حرفياً حقول SubscriptionPlanConfig التي يرجعها GET /api/subscription/plans

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
}