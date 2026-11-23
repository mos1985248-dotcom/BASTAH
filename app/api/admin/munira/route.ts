import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireRole } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { generateFree, groqServerKeyRef, openRouterServerKeyRef, providers } from "@/lib/munira/free-provider";
import { safeProviderError } from "@/lib/munira/free-router";

export const maxDuration = 60;

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

const create = z.object({
  provider: z.enum(providers),
  model: z.string().trim().min(1).max(160).regex(/^[a-zA-Z0-9_.:/-]+$/),
  apiKey: z.string().min(10).max(600).regex(/^[A-Za-z0-9._-]+$/).optional(),
  priority: z.number().int().min(1).max(1000),
}).strict();

const change = z.discriminatedUnion("action", [
  z.object({ action: z.literal("test"), id: z.string().cuid() }),
  z.object({ action: z.literal("enable"), id: z.string().cuid() }),
  z.object({ action: z.literal("disable"), id: z.string().cuid() }),
  z.object({ action: z.literal("priority"), id: z.string().cuid(), priority: z.number().int().min(1).max(1000) }),
]);

const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
function errorResponse(error: unknown) {
  if (error instanceof AuthError) return fail(error.message, error.status);
  console.error("[admin-munira] request failed");
  return fail("تعذّرت معالجة إعدادات منيرة.", 500);
}

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const [models, usage, plans] = await Promise.all([
      prisma.muniraModel.findMany({
        orderBy: [{ priority: "asc" }, { id: "asc" }],
        select: { id: true, provider: true, model: true, priority: true, enabled: true, freeVerified: true, lastCheckedAt: true, lastError: true },
      }),
      prisma.aIUsage.groupBy({ by: ["provider", "model"], where: { provider: { in: [...providers] } }, _count: { _all: true }, _sum: { totalTokens: true } }),
      prisma.subscriptionPlanConfig.findMany({ orderBy: { sortOrder: "asc" }, select: { nameAr: true, muniraMonthlyMessages: true, muniraTrialMessages: true } }),
    ]);
    return NextResponse.json({ paidBudgetUsd: 0, plans, models: models.map(model => {
      const totals = usage.find(item => item.provider === model.provider && item.model === model.model);
      return { ...model, requests: totals?._count._all ?? 0, tokens: totals?._sum.totalTokens ?? 0 };
    }) }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = create.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail("راجع المزود ومعرّف النموذج والمفتاح والأولوية.", 400);
    const { apiKey, ...model } = parsed.data;
    if (model.provider === "groq" && apiKey) return fail("يستخدم Groq مفتاح الخادم المخصص.", 400);
    if (model.provider === "gemini" && !apiKey) return fail("أدخل مفتاح المزود.", 400);
    const apiKeyEnc = model.provider === "groq" ? groqServerKeyRef :
      apiKey ? encryptSecret(apiKey) : openRouterServerKeyRef;
    // Rotation clears previous verification and requires explicit reactivation.
    await prisma.muniraModel.upsert({
      where: { provider_model: { provider: model.provider, model: model.model } },
      create: { ...model, apiKeyEnc },
      update: { apiKeyEnc, priority: model.priority, enabled: false, freeVerified: false, lastCheckedAt: null, lastError: null },
    });
    return NextResponse.json({ ok: true }, { status: 201, headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = change.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail("إجراء غير صالح.", 400);
    const { action, id } = parsed.data;
    const model = await prisma.muniraModel.findUnique({ where: { id } });
    if (!model) return fail("النموذج غير موجود.", 404);
    if (action === "disable" || action === "priority") {
      await prisma.muniraModel.update({
        where: { id },
        data: parsed.data.action === "priority" ? { priority: parsed.data.priority } : { enabled: false },
      });
      return NextResponse.json({ ok: true }, { headers });
    }

    let error: string | null = null;
    let probe: Awaited<ReturnType<typeof generateFree>> | null = null;
    try {
      probe = await generateFree(model, {
        system: "أجب بكلمة واحدة.", messages: [{ role: "user", content: "قل مرحبًا." }], maxTokens: 24,
      });
    } catch (cause) {
      error = safeProviderError(cause);
    }
    const uncertainCost = model.provider === "groq" || error === "NONZERO_COST" || error === "COST_UNVERIFIED";
    const [updated] = await prisma.$transaction([prisma.muniraModel.updateMany({
      where: { id, updatedAt: model.updatedAt },
      data: {
        lastCheckedAt: new Date(), freeVerified: model.provider !== "groq" && !error, lastError: error,
        ...(error || action === "enable" ? { enabled: !error } : {}),
      },
    }), prisma.aIUsage.create({ data: {
      provider: model.provider, model: model.model, feature: "connection_test", route: "/api/admin/munira",
      inputTokens: probe?.inputTokens ?? 0, outputTokens: probe?.outputTokens ?? 0,
      totalTokens: (probe?.inputTokens ?? 0) + (probe?.outputTokens ?? 0), success: !!probe,
      estimatedCostUsd: 0, costUsd: uncertainCost ? null : 0,
      costStatus: uncertainCost ? "INCOMPLETE" : "COMPLETE", errorMessage: error,
    } })]);
    if (!updated.count) return fail("تغيّر إعداد النموذج أثناء التحقق. أعد المحاولة.", 409);
    return NextResponse.json({ ok: !error, error }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
