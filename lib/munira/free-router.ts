import { prisma } from "@/lib/prisma";
import { generateFree, ProviderFailure, type Prompt } from "./free-provider";

export const freeUnavailable = "منيرة غير متاحة الآن على النماذج المجانية. جرّب مرة أخرى لاحقًا. لم تُخصم رسالة.";
export const safeProviderError = (error: unknown) => error instanceof ProviderFailure ? error.code : "UNAVAILABLE";

type Config = { provider: string; model: string; apiKeyEnc: string };

export async function routeThroughFreeModels<T extends Config>(
  models: T[],
  generate: (model: T) => ReturnType<typeof generateFree>,
  log: (model: T, result: Awaited<ReturnType<typeof generateFree>> | null, error: string | null) => Promise<void>,
  deadline = Number.POSITIVE_INFINITY,
) {
  for (const model of models) {
    if (Date.now() >= deadline) break;
    let result: Awaited<ReturnType<typeof generateFree>>;
    try {
      result = await generate(model);
    } catch (error) {
      await log(model, null, safeProviderError(error));
      continue;
    }
    await log(model, result, null);
    return result;
  }
  throw new ProviderFailure("FREE_MODELS_UNAVAILABLE");
}

export async function freeAnswer(
  prompt: Prompt,
  context: { feature: string; route: string; userId?: string; storeId?: string; sessionId?: string },
  timeoutMs = 45_000,
) {
  const models = await prisma.muniraModel.findMany({
    where: { enabled: true, ...(prompt.audio ? { provider: "gemini" } : {}) },
    orderBy: [{ priority: "asc" }, { id: "asc" }],
  });
  const sub = context.storeId ? await prisma.storeSubscription.findUnique({ where: { storeId: context.storeId }, select: { plan: true } }) : null;
  const deadline = Date.now() + timeoutMs;
  return routeThroughFreeModels(models, model => generateFree(model, prompt, Math.min(deadline, Date.now() + 18_000)), async (model, result, error) => {
    const uncertainCost = model.provider === "groq" || error === "NONZERO_COST" || error === "COST_UNVERIFIED";
    await prisma.$transaction([
      prisma.aIUsage.create({
        data: {
          ...context, provider: model.provider, model: model.model, planAtCall: sub?.plan,
          inputTokens: result?.inputTokens ?? 0, outputTokens: result?.outputTokens ?? 0,
          totalTokens: (result?.inputTokens ?? 0) + (result?.outputTokens ?? 0),
          estimatedCostUsd: 0, costUsd: uncertainCost ? null : 0,
          inputPriceUsdPerMTok: uncertainCost ? null : 0, outputPriceUsdPerMTok: uncertainCost ? null : 0,
          costStatus: uncertainCost ? "INCOMPLETE" : "COMPLETE", success: !!result, errorMessage: error,
        },
      }),
      prisma.muniraModel.updateMany({
        where: { id: model.id, updatedAt: model.updatedAt },
        data: { lastError: error, ...(error === "NONZERO_COST" ? { enabled: false, freeVerified: false } : {}) },
      }),
    ]);
  }, deadline);
}
