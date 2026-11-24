import sharp from "sharp";
import { z } from "zod";
import { fluxModel, imageSizes } from "./image-options";

export const imageBudget = 8000;
export const reservedNeurons = 1000;
export const busyImageMessage = "استوديو منيرة مشغول حاليًا، يمكنك المحاولة لاحقًا. لم يتم خصم أي صورة من رصيدك";
const steps = 4;
const freePlans = new Set(["free", "workers_free", "workers-free", "workers free"]);
const subscription = z.object({
  price: z.number().finite().nonnegative(),
  state: z.string(),
  rate_plan: z.object({ id: z.string().optional(), public_name: z.string().optional() }),
});
const billingResponse = z.object({ success: z.literal(true), result: z.array(subscription).min(1) });
const generationResponse = z.object({ success: z.literal(true), result: z.object({ image: z.string().min(4).max(6_000_000) }) });

export function isVerifiedFreeImageAccount(payload: unknown) {
  const parsed = billingResponse.safeParse(payload);
  if (!parsed.success) return false;
  const rows = parsed.data.result;
  return rows.some(row => row.state.toLowerCase() === "paid" && row.price === 0 &&
    [row.rate_plan.id, row.rate_plan.public_name].some(value => value && /workers/.test(value.toLowerCase()) && freePlans.has(value.toLowerCase()))) &&
    rows.every(row => row.price === 0 &&
      ![row.rate_plan.id, row.rate_plan.public_name].some(value => value && /workers.*(paid|unbound|bundled|standard)|(^|_)workers($|_)/i.test(value) && !freePlans.has(value.toLowerCase())));
}

function accountRequest(path: string, init?: RequestInit) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const key = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !/^[a-f0-9]{32}$/i.test(account) || !key) throw new Error("KEYS_MISSING");
  return fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/${path}`, {
    ...init, cache: "no-store", redirect: "error",
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json", "Content-Type": "application/json" },
    signal: AbortSignal.timeout(init?.method === "POST" ? 42000 : 7000),
  });
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

export type ImageSize = keyof typeof imageSizes;
export const imageProviders = {
  cloudflare: {
    models: [fluxModel] as readonly string[],
    async verify() {
      const response = await accountRequest("subscriptions");
      if (!response.ok || !isVerifiedFreeImageAccount(JSON.parse((await readBounded(response.body, 256_000)).toString()))) {
        throw new Error("BILLING_UNVERIFIED");
      }
    },
    async generate(model: string, prompt: string, size: ImageSize) {
      if (model !== fluxModel) throw new Error("UNSUPPORTED_MODEL");
      const response = await accountRequest(`ai/run/${model}`, {
        method: "POST", body: JSON.stringify({ prompt, steps }),
      });
      if (!response.ok) throw new Error(response.status === 429 ? "HTTP_429" : "PROVIDER_FAILURE");
      const payload = generationResponse.parse(JSON.parse((await readBounded(response.body, 6_100_000)).toString()));
      const original = Buffer.from(payload.result.image, "base64");
      const image = sharp(original, { limitInputPixels: 4_194_304, failOn: "error" });
      const info = await image.metadata();
      if (!info.width || !info.height || !["jpeg", "png", "webp"].includes(info.format ?? "") || (info.pages ?? 1) > 1) {
        throw new Error("INVALID_IMAGE");
      }
      const estimatedNeurons = Math.ceil(Math.ceil(info.width / 512) * Math.ceil(info.height / 512) * 4.8 + steps * 9.6);
      const { width, height } = imageSizes[size];
      const buffer = await image.resize(width, height, { fit: "cover" }).webp({ quality: 83 }).toBuffer();
      if (buffer.length > 2_097_152) throw new Error("LARGE_IMAGE");
      return { buffer, estimatedNeurons };
    },
  },
};
