import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { featureCatalog, featureDefault, planOrder } from "@/lib/feature-catalog";
import { getFeature } from "@/lib/entitlements";
import { grantLaunchPromotion, launchCapacity } from "@/lib/launch-promotion";

export const dynamic = "force-dynamic";
const key = z.string().regex(/^[a-z][a-z0-9_]{1,47}$/);
const limit = z.number().int().min(0).max(1000000).nullable();
const input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("feature"), key, label: z.string().trim().min(1).max(100), enabled: z.boolean(),
    rules: z.array(z.object({ plan: z.enum(planOrder), enabled: z.boolean(), limit })).max(4) }),
  z.object({ action: z.literal("override"), key, storeId: z.string().min(1).max(100), enabled: z.boolean(), limit,
    startsAt: z.string().datetime(), endsAt: z.string().datetime().nullable() }),
  z.object({ action: z.literal("promotion"), storeId: z.string().min(1).max(100) }),
]);

export async function GET(req: Request) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const storeId = new URL(req.url).searchParams.get("storeId");
    const [features, configs, changes, promotions] = await Promise.all([
      prisma.platformFeature.findMany({ include: { plans: true }, orderBy: { key: "asc" } }),
      prisma.subscriptionPlanConfig.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.featureChange.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.launchPromotion.findMany({ orderBy: { seat: "asc" }, select: { seat: true, storeId: true, startsAt: true, endsAt: true } }),
    ]);
    const matrix = [...new Set([...Object.keys(featureCatalog), ...features.map(row => row.key)])].map(key => {
      const feature = features.find(row => row.key === key);
      const defaults = featureDefault(key);
      return { key, label: feature?.label ?? defaults?.[0] ?? key, enabled: feature?.enabled ?? true,
        rules: planOrder.map((plan, i) => {
          const rule = feature?.plans.find(row => row.plan === plan);
          const config = configs.find(row => row.plan === plan);
          const enabled = !!defaults && i >= defaults[1];
          if (rule) return { plan, enabled: rule.enabled, limit: rule.limit };
          if (key === "products") return { plan, enabled, limit: config?.maxProducts ?? null };
          if (key === "munira") {
            const limit = (config?.muniraTrialMessages || config?.muniraMonthlyMessages) ?? 0;
            return { plan, enabled: limit > 0, limit };
          }
          if (key === "munira_images") return { plan, enabled: (config?.muniraMonthlyImages ?? 0) > 0, limit: config?.muniraMonthlyImages ?? 0 };
          if (key === "daftari") return { plan, enabled: config?.hasDaftari ?? enabled, limit: null };
          if (key === "coupons") return { plan, enabled: config?.hasDiscountCodes ?? enabled, limit: null };
          return { plan, enabled, limit: key === "cart_reminders" ? 1 : null };
        }) };
    });
    const decisions = storeId ? await Promise.all(matrix.map(async row => ({ key: row.key, ...await getFeature(storeId, row.key) }))) : null;
    return Response.json({ matrix, plans: configs.map(({ plan, nameAr }) => ({ plan, nameAr })), changes, promotions, capacity: launchCapacity, decisions });
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = input.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "تحقق من الحقول المدخلة." }, { status: 400 });
    const data = parsed.data;
    if (data.action === "promotion") {
      await grantLaunchPromotion(data.storeId, admin.id);
      return Response.json({ ok: true });
    }
    if (data.action === "override" && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
      return Response.json({ error: "تاريخ الانتهاء يجب أن يلي تاريخ البداية." }, { status: 400 });
    }
    if (data.action === "feature" && new Set(data.rules.map(rule => rule.plan)).size !== data.rules.length) {
      return Response.json({ error: "لا يمكن تكرار الباقة." }, { status: 400 });
    }
    await prisma.$transaction(async tx => {
      if (data.action === "feature") {
        const { key, label, enabled } = data;
        await tx.platformFeature.upsert({ where: { key }, create: { key, label, enabled }, update: { label, enabled } });
        for (const rule of data.rules) {
          await tx.planFeature.upsert({ where: { featureKey_plan: { featureKey: key, plan: rule.plan } }, create: { featureKey: key, ...rule }, update: rule });
        }
      } else {
        const defaults = featureDefault(data.key);
        if (defaults) await tx.platformFeature.upsert({ where: { key: data.key }, create: { key: data.key, label: defaults[0] }, update: {} });
        const rule = { enabled: data.enabled, limit: data.limit, startsAt: new Date(data.startsAt), endsAt: data.endsAt ? new Date(data.endsAt) : null };
        await tx.storeFeatureOverride.upsert({
          where: { storeId_featureKey: { storeId: data.storeId, featureKey: data.key } },
          create: { storeId: data.storeId, featureKey: data.key, ...rule }, update: rule,
        });
      }
      await tx.featureChange.create({ data: { actorId: admin.id, action: data.action, details: data } });
    });
    return Response.json({ ok: true });
  } catch (error) { return authErrorResponse(error); }
}
