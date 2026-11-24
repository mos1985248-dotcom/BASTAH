import { z } from "zod";
import { AuthError, authErrorResponse, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStudioImage, imageConfigSchema, imageInput, imageSettingsKey, studioSettings } from "@/lib/munira/image-studio";
import { imageBudget, imageProviders } from "@/lib/munira/image-provider";
import { planOrder } from "@/lib/feature-catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };
const input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("settings"), settings: z.unknown() }),
  z.object({ action: z.literal("quota"), plan: z.enum(planOrder), limit: z.number().int().min(0).max(1000) }),
  z.object({ action: z.literal("verify") }),
  z.object({ action: z.literal("test"), model: z.string().max(160), image: imageInput }),
]);

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const day = new Date().toISOString().slice(0, 10);
    const [settings, plans, today, month, usage, reserves] = await Promise.all([
      studioSettings(),
      prisma.subscriptionPlanConfig.findMany({
        select: { plan: true, nameAr: true, muniraMonthlyImages: true }, orderBy: { sortOrder: "asc" },
      }),
      prisma.muniraImage.count({ where: { day, state: "COMPLETE" } }),
      prisma.muniraImage.count({ where: { day: { startsWith: day.slice(0, 7) }, state: "COMPLETE" } }),
      prisma.muniraImage.groupBy({
        by: ["scope", "plan", "provider", "model", "state"], _count: true,
        _sum: { estimatedNeurons: true, measuredNeurons: true },
      }),
      prisma.muniraImage.aggregate({
        where: { provider: "cloudflare", createdAt: { gte: new Date(Date.now() - 86_400_000) } }, _sum: { neurons: true },
      }),
    ]);
    const lastFailure = await prisma.muniraImage.findFirst({
      where: { state: "FAILED" }, select: { model: true, error: true, createdAt: true }, orderBy: { createdAt: "desc" },
    });
    const storeIds = [...new Set(usage.filter(row => row.scope.startsWith("store:")).map(row => row.scope.slice(6)))];
    const stores = await prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, nameAr: true } });
    return Response.json({ settings, plans, today, month, usage, stores, lastFailure, paidBudgetUsd: 0,
      reserved: reserves._sum.neurons ?? 0, dayBudget: imageBudget,
    }, { headers });
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = input.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new AuthError("تحقق من الحقول المدخلة.", 400);
    const data = parsed.data;
    if (data.action === "verify") {
      try { await imageProviders.cloudflare.verify(); }
      catch (error) {
        const reason = error instanceof Error && error.message === "KEYS_MISSING" ? "KEYS_MISSING" : "BILLING_UNVERIFIED";
        return Response.json({ ok: false, reason }, { headers });
      }
      return Response.json({ ok: true }, { headers });
    }
    if (data.action === "test") {
      const id = await generateStudioImage(`admin:${user.id}`, data.image, undefined, data.model);
      return Response.json({ ok: true, id }, { headers });
    }
    if (data.action === "quota") {
      await prisma.$transaction(async tx => {
        await tx.subscriptionPlanConfig.update({ where: { plan: data.plan }, data: { muniraMonthlyImages: data.limit } });
        await tx.planFeature.updateMany({ where: { featureKey: "munira_images", plan: data.plan }, data: { limit: data.limit, enabled: data.limit > 0 } });
        await tx.featureChange.create({ data: { actorId: user.id, action: "munira_image_quota", details: data } });
      });
    } else {
      const settings = imageConfigSchema.safeParse(data.settings);
      if (!settings.success) throw new AuthError("إعدادات النموذج غير صالحة.", 400);
      if (settings.data.enabled) {
        try { await imageProviders.cloudflare.verify(); }
        catch { throw new AuthError("تعذّر التحقق من خطة Cloudflare المجانية.", 409); }
      }
      const value = JSON.stringify(settings.data);
      await prisma.$transaction(async tx => {
        await tx.platformSetting.upsert({ where: { key: imageSettingsKey },
          create: { key: imageSettingsKey, value, type: "json" }, update: { value } });
        await tx.featureChange.create({ data: { actorId: user.id, action: "munira_image_settings", details: settings.data } });
      });
    }
    return Response.json({ ok: true }, { headers });
  } catch (error) { return authErrorResponse(error); }
}
