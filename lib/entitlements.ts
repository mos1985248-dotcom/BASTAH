import type { Prisma, SubscriptionPlan } from "@prisma/client";
import { prisma } from "./prisma";
import { featureDefault, planOrder } from "./feature-catalog";

export async function effectivePlan(db: Prisma.TransactionClient, storeId: string, now = new Date()) {
  const [subscription, promotion] = await Promise.all([
    db.storeSubscription.findUnique({
      where: { storeId }, select: { plan: true, status: true, endDate: true, trialEndsAt: true, gracePeriodEndsAt: true, customMaxProducts: true, store: { select: { status: true } } },
    }),
    db.launchPromotion.findUnique({ where: { storeId } }),
  ]);
  const expired = !!subscription && (
    subscription.status === "EXPIRED" ||
    (subscription.status === "ACTIVE" && subscription.plan !== "FREE" && !!subscription.endDate && subscription.endDate <= now) ||
    (subscription.status === "TRIAL" && !!subscription.trialEndsAt && subscription.trialEndsAt <= now) ||
    (subscription.status === "GRACE_PERIOD" && !!subscription.gracePeriodEndsAt && subscription.gracePeriodEndsAt <= now)
  );
  const storeActive = subscription?.store.status === "ACTIVE";
  const active = !!subscription && !expired && storeActive &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIAL" || subscription.status === "GRACE_PERIOD");
  let plan = subscription?.plan ?? "FREE";
  const hasPromotion = !!promotion && promotion.startsAt <= now && promotion.endsAt > now;
  if (active && hasPromotion && planOrder.indexOf(plan) < planOrder.indexOf("GROWTH")) plan = "GROWTH";
  const paidThrough = subscription?.status === "TRIAL" ? subscription.trialEndsAt : subscription?.endDate;
  const endedNaturally = expired || (subscription?.status === "SUSPENDED" &&
    !!subscription.gracePeriodEndsAt && subscription.gracePeriodEndsAt <= now);
  const retainedMuniraThrough = subscription?.store.status === "ACTIVE" && paidThrough && paidThrough <= now &&
    (endedNaturally || subscription.status === "GRACE_PERIOD") ? paidThrough : null;
  return { plan, active, storeActive, expired, retainedMuniraThrough, customMaxProducts: subscription?.customMaxProducts, promotion: hasPromotion ? promotion : null };
}

export async function resolveFeature(db: Prisma.TransactionClient, storeId: string, featureKey: string, now = new Date()) {
  const [subscription, feature, override] = await Promise.all([
    effectivePlan(db, storeId, now),
    db.platformFeature.findUnique({ where: { key: featureKey }, include: { plans: true } }),
    db.storeFeatureOverride.findUnique({ where: { storeId_featureKey: { storeId, featureKey } } }),
  ]);
  const plan = subscription.plan;
  const config = await db.subscriptionPlanConfig.findUnique({ where: { plan } });
  const rule = feature?.plans.find(row => row.plan === plan);
  const activeOverride = override && override.startsAt <= now && (!override.endsAt || override.endsAt > now) ? override : null;
  const defaults = featureDefault(featureKey);
  let defaultEnabled = !!defaults && planOrder.indexOf(plan) >= defaults[1];
  let defaultLimit: number | null = null;
  if (featureKey === "products") defaultLimit = subscription.customMaxProducts ?? config?.maxProducts ?? null;
  if (featureKey === "daftari") defaultEnabled = config?.hasDaftari ?? defaultEnabled;
  if (featureKey === "coupons") defaultEnabled = config?.hasDiscountCodes ?? defaultEnabled;
  if (featureKey === "munira") {
    defaultLimit = (config?.muniraTrialMessages || config?.muniraMonthlyMessages) ?? 0;
    defaultEnabled = defaultLimit > 0;
  }
  if (featureKey === "cart_reminders") defaultLimit = 1;

  const enabled = activeOverride?.enabled ?? rule?.enabled ?? defaultEnabled;
  const eligible = featureKey === "pricing" ? subscription.storeActive : subscription.active;
  const reason = !eligible ? (featureKey === "pricing" ? "inactive_store" : "inactive_subscription")
    : feature?.enabled === false ? "disabled_on_platform"
    : activeOverride ? "store_exception" : "plan";
  const requiredPlan = planOrder.find(candidate => {
    const candidateRule = feature?.plans.find(row => row.plan === candidate);
    return candidateRule?.enabled ?? (!!defaults && planOrder.indexOf(candidate) >= defaults[1]);
  }) ?? null;
  return {
    allowed: eligible && feature?.enabled !== false && enabled,
    retainedMuniraThrough: featureKey === "munira" && feature?.enabled !== false && enabled
      ? subscription.retainedMuniraThrough : null,
    limit: activeOverride?.limit ?? (rule ? rule.limit : defaultLimit),
    plan, reason, requiredPlan, active: subscription.active, expired: subscription.expired,
    trialMessages: config?.muniraTrialMessages ?? 0,
    planName: config?.nameAr ?? plan,
  };
}

export function getFeature(storeId: string, key: string) {
  return resolveFeature(prisma, storeId, key);
}

export async function planDisplayName(plan: SubscriptionPlan | null) {
  if (!plan) return null;
  const config = await prisma.subscriptionPlanConfig.findUnique({ where: { plan }, select: { nameAr: true } });
  return config?.nameAr ?? null;
}
