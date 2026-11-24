import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "../prisma";
import { AuthError } from "../auth";
import { getSupabaseAdminClient } from "../supabase-admin";
import { resolveFeature } from "../entitlements";
import { quotaWindow } from "./quota";
import { redactPrompt } from "./context";
import { sanitizeUserInput } from "./security";
import { fluxModel, imageKinds, imageSizes } from "./image-options";
import { busyImageMessage, imageBudget, imageProviders, logCloudflare, reservedNeurons, safeCloudflareDiagnostic } from "./image-provider";

export const imageSettingsKey = "munira.image-studio";
export const studioBucket = "munira-private";
export const imageConfigSchema = z.object({
  enabled: z.boolean(),
  models: z.array(z.object({
    provider: z.enum(["cloudflare"]), model: z.string().max(160),
    enabled: z.boolean(), priority: z.number().int().min(1).max(1000),
  })).max(10),
}).superRefine(({ models }, context) => {
  if (new Set(models.map(row => `${row.provider}/${row.model}`)).size !== models.length ||
    models.some(row => !imageProviders[row.provider].models.includes(row.model))) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "نموذج غير مدعوم أو مكرر." });
  }
});
export const imageInput = z.object({
  requestId: z.string().uuid(),
  prompt: z.string().trim().min(3).max(800),
  kind: z.enum(["product", "background", "social", "cover", "advertisement", "custom"]),
  size: z.enum(["square", "portrait", "landscape"]),
}).strict();
type ImageInput = z.infer<typeof imageInput>;

export async function studioSettings() {
  const setting = await prisma.platformSetting.findUnique({ where: { key: imageSettingsKey } });
  if (!setting) return { enabled: false, models: [{ provider: "cloudflare" as const, model: fluxModel, enabled: false, priority: 1 }] };
  try { return imageConfigSchema.parse(JSON.parse(setting.value)); }
  catch { return { enabled: false, models: [] }; }
}

export function studioStorage() {
  return getSupabaseAdminClient().storage.from(studioBucket);
}

export async function imageQuota(storeId: string, now = new Date()) {
  const access = await resolveFeature(prisma, storeId, "munira_images", now);
  const window = quotaWindow(0, 0, now).key;
  const limit = access.limit ?? 0;
  const used = await prisma.muniraImage.count({ where: { scope: `store:${storeId}`, window, state: "COMPLETE" } });
  const [year, month] = window.split("-").map(Number);
  const resetAt = new Date(Date.UTC(year, month, 1) - 3 * 60 * 60 * 1000);
  return { allowed: access.allowed && limit > 0, limit, used, remaining: Math.max(0, limit - used), resetAt, requiredPlan: access.requiredPlan };
}

export async function generateStudioImage(scope: string, input: ImageInput, storeId?: string, testModel?: string) {
  const clean = redactPrompt(input.prompt);
  const inputHash = createHash("sha256").update(JSON.stringify([input.prompt, input.kind, input.size, testModel ?? null])).digest("hex");
  if (!sanitizeUserInput(clean).safe || clean.length > 800 ||
    /(?:child\s*(?:porn|sexual)|sexual\s*(?:image\s+of\s+a\s+)?(?:minor|child)|إباحي.{0,20}(?:طفل|قاصر)|(?:طفل|قاصر).{0,20}إباحي)/iu.test(clean)) throw new AuthError("راجع وصف الصورة وحاول مجددًا.", 400);
  const key = { scope, requestId: input.requestId };
  const replay = async () => {
    const existing = await prisma.muniraImage.findUnique({ where: { scope_requestId: key } });
    if (!existing) return null;
    if (existing.inputHash !== inputHash || existing.state !== "COMPLETE" || existing.deletedAt) {
      throw new AuthError("سبق استخدام معرّف هذا الطلب.", 409);
    }
    return existing.id;
  };
  const previous = await replay();
  if (previous) return previous;
  const settings = await studioSettings();
  const model = settings.enabled
    ? testModel ? settings.models.find(row => row.model === testModel)
      : settings.models.filter(row => row.enabled).sort((a, b) => a.priority - b.priority)[0]
    : undefined;
  if (!model) throw new AuthError(busyImageMessage, 503);
  const provider = imageProviders[model.provider];

  const reservation = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(441298117)`;
    const existing = await tx.muniraImage.findUnique({ where: { scope_requestId: key } });
    if (existing) {
      if (existing.inputHash === inputHash && existing.state === "COMPLETE" && !existing.deletedAt) return { id: existing.id, replayed: true };
      throw new AuthError("سبق استخدام معرّف هذا الطلب.", 409);
    }
    const now = new Date();
    const window = quotaWindow(0, 0, now).key;
    const day = now.toISOString().slice(0, 10);
    const access = storeId ? await resolveFeature(tx, storeId, "munira_images", now) : null;
    if (access && (!access.allowed || !access.limit)) throw new AuthError("توليد الصور غير متاح في اشتراك متجرك.", 403);
    const inFlight = await tx.muniraImage.count({ where: { scope, state: "PENDING", createdAt: { gte: new Date(now.getTime() - 180_000) } } });
    if (inFlight) throw new AuthError("لديك طلب قيد المعالجة.", 429);
    const last = await tx.muniraImage.count({ where: { scope, createdAt: { gt: new Date(now.getTime() - 15_000) } } });
    if (last) throw new AuthError("انتظر قليلًا قبل إنشاء صورة أخرى.", 429);
    if (access) {
      const used = await tx.muniraImage.count({ where: { scope, window, state: "COMPLETE" } });
      if (used >= access.limit!) throw new AuthError("استُهلكت حصة الصور لهذا الشهر.", 429);
    }
    const stored = await tx.muniraImage.count({ where: { scope, state: "COMPLETE", deletedAt: null } });
    if (stored >= 100) throw new AuthError("مكتبتك ممتلئة. احذف صورة قبل إنشاء أخرى.", 409);
    const budget = await tx.muniraImage.aggregate({
      where: { provider: model.provider, createdAt: { gte: new Date(now.getTime() - 86_400_000) } }, _sum: { neurons: true },
    });
    if ((budget._sum.neurons ?? 0) + reservedNeurons > imageBudget) {
      logCloudflare("budget", { code: "HTTP_429" });
      throw new AuthError(busyImageMessage, 429);
    }
    const row = await tx.muniraImage.create({ data: {
      ...key, inputHash, window, day, plan: access?.plan, provider: model.provider, model: model.model,
      state: "PENDING", neurons: reservedNeurons,
    } });
    return { id: row.id, replayed: false };
  });

  if (reservation.replayed) return reservation.id;
  const objectPath = `${scope.replace(":", "/")}/${reservation.id}.webp`;
  let uploaded = false;
  let dispatched = false;
  try {
    await provider.verify();
    const latest = await studioSettings();
    if (!latest.enabled || !latest.models.some(row => row.model === model.model && row.provider === model.provider && (row.enabled || testModel))) {
      throw new Error("STUDIO_DISABLED");
    }
    dispatched = true;
    const image = await provider.generate(model.model, `${imageKinds[input.kind]}. ${clean}`, input.size);
    try {
      const { error } = await studioStorage().upload(objectPath, image.buffer, { contentType: "image/webp", upsert: false });
      if (error) throw error;
    } catch {
      throw new Error("STORAGE_FAILURE");
    }
    uploaded = true;
    await prisma.muniraImage.update({ where: { id: reservation.id }, data: {
      state: "COMPLETE", objectPath, estimatedNeurons: image.estimatedNeurons,
    } });
    return reservation.id;
  } catch (failure) {
    if (uploaded) await studioStorage().remove([objectPath]).catch(() => {});
    const localFailure = failure instanceof Error && /^(HTTP_429|STORAGE_FAILURE|INVALID_IMAGE|LARGE_RESPONSE|LARGE_IMAGE|STUDIO_DISABLED)$/.test(failure.message)
      ? failure.message as "HTTP_429" | "STORAGE_FAILURE" | "INVALID_IMAGE" | "LARGE_RESPONSE" | "LARGE_IMAGE" | "STUDIO_DISABLED"
      : dispatched ? "GENERATION_FAILED" : "UNEXPECTED_RESPONSE";
    const diagnostic = safeCloudflareDiagnostic(failure, localFailure);
    if (dispatched) logCloudflare(diagnostic.code === "STORAGE_FAILURE" ? "storage" : "generation", diagnostic);
    await prisma.muniraImage.update({ where: { id: reservation.id }, data: { state: "FAILED", error: diagnostic.code, ...(!dispatched && { neurons: 0 }) } });
    throw new AuthError(busyImageMessage, 503);
  }
}

export async function ownedStudioImage(scope: string, id: string) {
  const row = await prisma.muniraImage.findFirst({ where: { id, scope, state: "COMPLETE", deletedAt: null } });
  if (!row?.objectPath) throw new AuthError("الصورة غير موجودة.", 404);
  return { ...row, objectPath: row.objectPath };
}

export async function studioFile(scope: string, id: string, download: boolean) {
  const image = await ownedStudioImage(scope, id);
  const { data, error } = await studioStorage().download(image.objectPath);
  if (error || !data) throw new AuthError("تعذّر تحميل الصورة.", 502);
  return new Response(data, { headers: {
    "Content-Type": "image/webp", "Cache-Control": "private, no-store",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="munira-${image.id}.webp"`,
  } });
}
