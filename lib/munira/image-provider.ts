import { randomInt } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { fluxModel, imagePresets, imageSizes, isImagePreset, type ImageSize } from "./image-options";

export const imageBudget = 8000;
export const reservedNeurons = 1000;
export const busyImageMessage = "استوديو منيرة مشغول حاليًا، يمكنك المحاولة لاحقًا. لم يتم خصم أي صورة من رصيدك";
const steps = 4;
const freePlans = new Set(["workers free", "cloudflare workers free", "workers free plan"]);
const liveStates = new Set(["paid", "provisioned", "active"]);
const subscription = z.object({
  price: z.union([z.number().finite().nonnegative(), z.string().regex(/^\d+(?:\.\d+)?$/).transform(Number)]).optional().nullable(),
  state: z.string().optional().nullable(),
  rate_plan: z.object({ id: z.string().optional().nullable(), public_name: z.string().optional().nullable() }).optional().nullable(),
});
const billingResponse = z.object({ success: z.literal(true), result: z.array(subscription) });
const generationResponse = z.object({ success: z.literal(true), result: z.object({ image: z.string().min(4).max(6_000_000) }) });
const errorEnvelope = z.object({ errors: z.array(z.object({ code: z.number().int().nonnegative().max(999999) })).max(20).optional() });

export const cloudflareCodes = [
  "VERIFIED_FREE", "MANUAL_FREE_TEST", "KEYS_MISSING", "ACCOUNT_INVALID", "AUTH_INVALID", "PERMISSION_DENIED",
  "ACCOUNT_NOT_FOUND", "BILLING_AUTH_REJECTED", "TOKEN_UNVERIFIED", "NETWORK_FAILURE", "UNEXPECTED_RESPONSE", "BILLING_UNVERIFIED",
  "BILLING_PAID_OR_AMBIGUOUS", "HTTP_429", "GENERATION_FAILED", "STORAGE_FAILURE",
  "INVALID_IMAGE", "LARGE_RESPONSE", "LARGE_IMAGE", "STUDIO_DISABLED",
] as const;
export type CloudflareCode = typeof cloudflareCodes[number];
export type CloudflareDiagnostic = {
  code: CloudflareCode; httpStatus?: number; providerCodes?: number[];
  evidence?: { subscriptions: number; workersRows: number; freeActive: number; contradictory: number };
};

export class CloudflareDiagnosticError extends Error {
  constructor(public diagnostic: CloudflareDiagnostic) { super(diagnostic.code); }
}

export function logCloudflare(stage: "billing" | "generation" | "storage" | "budget", detail: CloudflareDiagnostic) {
  const write = detail.code === "VERIFIED_FREE" ? console.info : console.warn;
  write("[MUNIRA-CLOUDFLARE]", { stage, code: detail.code, httpStatus: detail.httpStatus, providerCodes: detail.providerCodes, evidence: detail.evidence });
}

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ") ?? "";
}

export function inspectCloudflareBilling(payload: unknown): CloudflareDiagnostic {
  const parsed = billingResponse.safeParse(payload);
  if (!parsed.success) return { code: "UNEXPECTED_RESPONSE" };
  let workersRows = 0, freeActive = 0, contradictory = 0;
  for (const row of parsed.data.result) {
    const labels = [normalize(row.rate_plan?.id), normalize(row.rate_plan?.public_name)].filter(Boolean);
    const workerLabels = labels.filter(label => /\bworkers?\b/.test(label));
    if (workerLabels.length) workersRows++;
    const explicitlyFree = workerLabels.some(label => freePlans.has(label));
    const otherWorkersPlan = workerLabels.some(label => !freePlans.has(label));
    const knownPrice = typeof row.price === "number" && Number.isFinite(row.price);
    if (!knownPrice || row.price !== 0 || !labels.length || otherWorkersPlan) contradictory++;
    if (explicitlyFree && !otherWorkersPlan && row.price === 0 && liveStates.has(normalize(row.state))) freeActive++;
  }
  return {
    code: contradictory ? "BILLING_PAID_OR_AMBIGUOUS" : freeActive ? "VERIFIED_FREE" : "BILLING_UNVERIFIED",
    evidence: { subscriptions: parsed.data.result.length, workersRows, freeActive, contradictory },
  };
}

export function isVerifiedFreeImageAccount(payload: unknown) {
  return inspectCloudflareBilling(payload).code === "VERIFIED_FREE";
}

async function accountRequest(path: string, init?: RequestInit, userScoped = false) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const key = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!account || !key) throw new CloudflareDiagnosticError({ code: "KEYS_MISSING" });
  if (!/^[a-f0-9]{32}$/i.test(account)) throw new CloudflareDiagnosticError({ code: "ACCOUNT_INVALID" });
  try {
    return await fetch(`https://api.cloudflare.com/client/v4/${userScoped ? "user" : `accounts/${account}`}/${path}`, {
      ...init, cache: "no-store", redirect: "error",
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json", "Content-Type": "application/json" },
      signal: AbortSignal.timeout(init?.method === "POST" ? 42000 : 7000),
    });
  } catch { throw new CloudflareDiagnosticError({ code: "NETWORK_FAILURE" }); }
}

async function responseDiagnostic(response: Response, fallback: CloudflareCode): Promise<CloudflareDiagnostic> {
  let providerCodes: number[] = [];
  try {
    const result = errorEnvelope.safeParse(JSON.parse((await readBounded(response.body, 32_000)).toString()));
    if (result.success) providerCodes = result.data.errors?.map(error => error.code) ?? [];
  } catch { /* Ignore untrusted errors and keep the HTTP classification. */ }
  const code = response.status === 401 ? "AUTH_INVALID"
    : response.status === 403 ? "PERMISSION_DENIED"
    : response.status === 404 ? "ACCOUNT_NOT_FOUND"
    : response.status === 429 ? "HTTP_429" : fallback;
  return { code, httpStatus: response.status, providerCodes };
}

async function diagnoseBillingAuthentication(result: CloudflareDiagnostic): Promise<CloudflareDiagnostic> {
  // A 9106 from subscriptions does not distinguish a rejected token from an endpoint scope mismatch.
  const verification = z.object({ success: z.literal(true), result: z.object({ status: z.literal("active") }) });
  let responded = false;
  for (const userScoped of [false, true]) {
    try {
      const response = await accountRequest("tokens/verify", undefined, userScoped);
      responded = true;
      if (response.ok && verification.safeParse(JSON.parse((await readBounded(response.body, 32_000)).toString())).success) {
        return { ...result, code: "BILLING_AUTH_REJECTED" };
      }
    } catch { /* The other token type can still be checked without inference or billing changes. */ }
  }
  return { ...result, code: responded ? "TOKEN_UNVERIFIED" : "NETWORK_FAILURE" };
}

export function safeCloudflareDiagnostic(error: unknown, fallback: CloudflareCode): CloudflareDiagnostic {
  return error instanceof CloudflareDiagnosticError ? error.diagnostic : { code: fallback };
}

export async function readBounded(body: ReadableStream<Uint8Array> | null, maxBytes: number) {
  if (!body) throw new Error("EMPTY_BODY");
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new Error("LARGE_RESPONSE");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, length);
}

export type { ImageSize } from "./image-options";
export const pollinationsModel = "flux";
export const pollinationsCooldownMs = 45_000;

export function pollinationsImageUrl(prompt: string, seed = randomInt(1, 2_147_483_647), size?: ImageSize) {
  const { width, height } = size && isImagePreset(size) ? imagePresets[size] : { width: 1024, height: 1024 };
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=${width}&height=${height}&nologo=true&seed=${seed}`;
}

export const openRouterImageModel = "recraft/recraft-v4.1-flash-v2:free";
export const openRouterImageSunset = Date.parse("2026-11-28T00:00:00Z");

async function openRouterJson(path: string, key: string, init?: RequestInit) {
  const response = await fetch("https://openrouter.ai/api/v1/" + path, {
    ...init, cache: "no-store", redirect: "error",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(init?.method === "POST" ? 30000 : 5000),
  });
  if (!response.ok) throw new Error("HTTP_" + response.status);
  return JSON.parse((await readBounded(response.body, init?.method === "POST" ? 12_000_000 : 4_000_000)).toString());
}

const freeImageEndpoint = z.object({
  provider_slug: z.string().regex(/^[a-z0-9-]+$/),
  provider_tag: z.string().regex(/^[a-z0-9-]+$/),
  pricing: z.array(z.object({ billable: z.string(), cost_usd: z.literal(0) })).min(1),
});
async function verifyOpenRouterImage(model: string) {
  if (model !== openRouterImageModel || Date.now() >= openRouterImageSunset) throw new Error("MODEL_NOT_FREE");
  const key = process.env.MUNIRA_OPENROUTER_API_KEY?.trim();
  if (!key) throw new Error("OPENROUTER_KEY_MISSING");
  const account = await openRouterJson("key", key);
  if (account.data?.is_free_tier !== true || account.data?.is_management_key === true) throw new Error("BILLING_UNVERIFIED");
  const catalog = await openRouterJson("images/models", key);
  if (!Array.isArray(catalog.data) || !catalog.data.some((entry: { id?: string; architecture?: { output_modalities?: string[] } }) =>
    entry.id === model && entry.architecture?.output_modalities?.includes("image"))) throw new Error("MODEL_NOT_FREE");
  const endpoint = await openRouterJson("images/models/" + model + "/endpoints", key);
  const parsed = z.object({ id: z.literal(model), endpoints: z.array(freeImageEndpoint).min(1) }).safeParse(endpoint);
  if (!parsed.success || !parsed.data.endpoints.every(e => e.pricing.some(p => p.billable === "output_image"))) throw new Error("MODEL_NOT_FREE");
  return { key, provider: parsed.data.endpoints[0].provider_tag };
}

export const imageProviders = {
  openrouter: {
    models: [openRouterImageModel] as readonly string[],
    async verify() { /* Verification occurs immediately before dispatch in generate. */ },
    async generate(model: string, prompt: string, size: ImageSize) {
      const { key, provider } = await verifyOpenRouterImage(model);
      const result = await openRouterJson("images", key, {
        method: "POST", body: JSON.stringify({
          model, prompt, n: 1, aspect_ratio: isImagePreset(size) ? imagePresets[size].aspectRatio : size === "square" ? "1:1" : size === "portrait" ? "4:5" : "16:9",
          provider: { only: [provider], allow_fallbacks: false },
        }),
      });
      if (result.usage?.cost !== 0) throw new Error("COST_UNVERIFIED");
      const data = result.data?.[0]?.b64_json;
      if (typeof data !== "string" || data.length > 10_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) throw new Error("INVALID_IMAGE");
      const image = sharp(Buffer.from(data, "base64"), { limitInputPixels: 4_194_304, failOn: "error" });
      const info = await image.metadata();
      if (!info.width || !info.height || !["jpeg", "png", "webp"].includes(info.format ?? "") || (info.pages ?? 1) > 1) throw new Error("INVALID_IMAGE");
      const { width, height } = isImagePreset(size) ? imagePresets[size] : imageSizes[size];
      const buffer = await image.resize(width, height, { fit: "cover" }).webp({ quality: 90 }).toBuffer();
      if (buffer.length > 2_097_152) throw new Error("LARGE_IMAGE");
      return { buffer, estimatedNeurons: 0 };
    },
  },
  pollinations: {
    models: [pollinationsModel] as readonly string[],
    async verify() {
      // The legacy endpoint can serve a free request. Never provide billing credentials.
    },
    async generate(model: string, prompt: string, size: ImageSize) {
      if (model !== pollinationsModel) throw new Error("UNSUPPORTED_MODEL");
      const seed = randomInt(1, 2_147_483_647);
      const response = await fetch(pollinationsImageUrl(prompt, seed, size), {
        method: "GET", cache: "no-store", redirect: "error",
        headers: { Accept: "image/jpeg, image/png" }, signal: AbortSignal.timeout(30_000),
      });
      if (response.status === 402 || response.status === 429) throw new Error("HTTP_429");
      if (!response.ok) throw new Error("GENERATION_FAILED");
      const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      if (contentType !== "image/jpeg" && contentType !== "image/png") throw new Error("INVALID_IMAGE");
      const input = await readBounded(response.body, 8_388_608);
      const image = sharp(input, { limitInputPixels: 4_194_304, failOn: "error" });
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height ||
          (metadata.format !== "jpeg" && metadata.format !== "png") || (metadata.pages ?? 1) > 1) {
        throw new Error("INVALID_IMAGE");
      }
      if (response.headers.get("x-pollinations-logo")) {
        // Classic branded images place the logo in the bottom edge.
        const height = Math.max(1, Math.floor(metadata.height * 0.945));
        image.extract({ left: 0, top: 0, width: metadata.width, height });
      }
      const { width, height } = isImagePreset(size) ? imagePresets[size] : size === "square" ? { width: 1024, height: 1024 } : imageSizes[size];
      const buffer = await image.resize(width, height, { fit: "cover", position: "centre" })
        .webp({ quality: 89 }).toBuffer();
      if (buffer.length > 2_097_152) throw new Error("LARGE_IMAGE");
      return { buffer, estimatedNeurons: 0, seed };
    },
  },
  cloudflare: {
    models: [fluxModel] as readonly string[],
    async verify() {
      let result: CloudflareDiagnostic;
      try {
        const response = await accountRequest("subscriptions");
        result = response.ok
          ? { ...inspectCloudflareBilling(JSON.parse((await readBounded(response.body, 256_000)).toString())), httpStatus: response.status }
          : await responseDiagnostic(response, "UNEXPECTED_RESPONSE");
      } catch (error) { result = safeCloudflareDiagnostic(error, "UNEXPECTED_RESPONSE"); }
      if (result.httpStatus === 400 && result.providerCodes?.includes(9106)) result = await diagnoseBillingAuthentication(result);
      logCloudflare("billing", result);
      if (result.code !== "VERIFIED_FREE") throw new CloudflareDiagnosticError(result);
      return result;
    },
    async generate(model: string, prompt: string, size: ImageSize) {
      if (model !== fluxModel) throw new Error("UNSUPPORTED_MODEL");
      const response = await accountRequest(`ai/run/${model}`, {
        method: "POST", body: JSON.stringify({ prompt, steps }),
      });
      if (!response.ok) throw new CloudflareDiagnosticError(await responseDiagnostic(response, "GENERATION_FAILED"));
      const payload = generationResponse.parse(JSON.parse((await readBounded(response.body, 6_100_000)).toString()));
      const original = Buffer.from(payload.result.image, "base64");
      const image = sharp(original, { limitInputPixels: 4_194_304, failOn: "error" });
      const info = await image.metadata();
      if (!info.width || !info.height || !["jpeg", "png", "webp"].includes(info.format ?? "") || (info.pages ?? 1) > 1) {
        throw new Error("INVALID_IMAGE");
      }
      const estimatedNeurons = Math.ceil(Math.ceil(info.width / 512) * Math.ceil(info.height / 512) * 4.8 + steps * 9.6);
      const { width, height } = isImagePreset(size) ? imagePresets[size] : imageSizes[size];
      const buffer = await image.resize(width, height, { fit: "cover" }).webp({ quality: 83 }).toBuffer();
      if (buffer.length > 2_097_152) throw new Error("LARGE_IMAGE");
      return { buffer, estimatedNeurons };
    },
  },
};
