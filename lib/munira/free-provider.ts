import { decryptSecret } from "@/lib/crypto";
import { googleVerifierToken } from "./google-billing";
import { filterOutput } from "./security";

export const providers = ["openrouter", "gemini", "groq"] as const;
export type FreeProvider = typeof providers[number];
type Model = { provider: string; model: string; apiKeyEnc: string };
type Message = { role: "user" | "assistant"; content: string };
export type Usage = { inputTokens: number; outputTokens: number };
export type Prompt = { system: string; messages: Message[]; maxTokens: number; audio?: { data: string; mimeType: string } };

export class ProviderFailure extends Error {
  constructor(public code: string) { super(code); }
}

async function json(url: string, init: RequestInit | undefined, deadline: number, timeout = 4000) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new ProviderFailure("UNAVAILABLE");
  try {
    const response = await fetch(url, { ...init, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(Math.min(timeout, remaining)) });
    if (!response.ok) throw new ProviderFailure(`HTTP_${response.status}`);
    return await response.json();
  } catch (error) {
    if (error instanceof ProviderFailure) throw error;
    throw new ProviderFailure("UNAVAILABLE");
  }
}

const bearer = (key: string) => ({ Authorization: `Bearer ${key}`, "Content-Type": "application/json" });
const geminiModel = /^[a-zA-Z0-9_.-]+$/;
const zeroPrice = (value: unknown) => typeof value === "string" && /^0+(?:\.0+)?$/.test(value);

export function isFreeOpenRouterModel(entry: { id?: string; pricing?: Record<string, unknown> }, model: string) {
  const pricing = entry.pricing;
  return Boolean(model.endsWith(":free") && entry.id === model && pricing &&
    zeroPrice(pricing.prompt) && zeroPrice(pricing.completion) && Object.values(pricing).every(zeroPrice));
}

export const openRouterServerKeyRef = "server:MUNIRA_OPENROUTER_API_KEY";
export const groqServerKeyRef = "server:GROQ_API_KEY";

function modelKey(model: Model) {
  if (model.provider === "openrouter" && model.apiKeyEnc === openRouterServerKeyRef) {
    const key = process.env.MUNIRA_OPENROUTER_API_KEY;
    if (!key) throw new ProviderFailure("OPENROUTER_KEY_MISSING");
    return key;
  }
  if (model.provider !== "groq") return decryptSecret(model.apiKeyEnc);
  if (model.apiKeyEnc !== groqServerKeyRef || process.env.MUNIRA_GROQ_FREE_TIER_CONFIRMED !== "true") {
    throw new ProviderFailure("BILLING_UNVERIFIED");
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new ProviderFailure("GROQ_KEY_MISSING");
  return key;
}

export async function verifyFreeModel(model: Model, key = modelKey(model), deadline = Date.now() + 18_000) {
  if (model.provider === "openrouter") {
    if (!model.model.endsWith(":free")) throw new ProviderFailure("MODEL_NOT_FREE");
    const { data } = await json("https://openrouter.ai/api/v1/models", { headers: bearer(key) }, deadline);
    if (!Array.isArray(data) || !data.some(entry => isFreeOpenRouterModel(entry, model.model))) {
      throw new ProviderFailure("MODEL_NOT_FREE");
    }
    const account = await json("https://openrouter.ai/api/v1/key", { headers: bearer(key) }, deadline);
    if (account.data?.is_free_tier !== true || account.data?.is_management_key === true) {
      throw new ProviderFailure("BILLING_UNVERIFIED");
    }
    return;
  }

  if (model.provider === "gemini") {
    const token = await googleVerifierToken();
    const project = process.env.MUNIRA_GOOGLE_FREE_PROJECT_NUMBER;
    const projectId = process.env.MUNIRA_GOOGLE_FREE_PROJECT_ID;
    if (!token || !project || !/^\d+$/.test(project) || !projectId || !/^[a-z][a-z0-9-]{4,29}$/.test(projectId)) throw new ProviderFailure("BILLING_UNVERIFIED");
    if (!geminiModel.test(model.model)) throw new ProviderFailure("INVALID_MODEL");
    const headers = bearer(token);
    const lookup = await json(`https://apikeys.googleapis.com/v2/keys:lookupKey?keyString=${encodeURIComponent(key)}`, { headers }, deadline);
    if (lookup.parent !== `projects/${project}/locations/global`) throw new ProviderFailure("BILLING_UNVERIFIED");
    const resource = await json(`https://cloudresourcemanager.googleapis.com/v3/projects/${project}`, { headers }, deadline);
    if (resource.projectId !== projectId) throw new ProviderFailure("BILLING_UNVERIFIED");
    const billing = await json(`https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`, { headers }, deadline);
    if (billing.billingEnabled !== false) throw new ProviderFailure("BILLING_UNVERIFIED");
    const info = await json(`https://generativelanguage.googleapis.com/v1beta/models/${model.model}`, { headers: { "x-goog-api-key": key } }, deadline);
    if (!info.supportedGenerationMethods?.includes("generateContent")) throw new ProviderFailure("INVALID_MODEL");
    return;
  }

  if (model.provider === "groq") {
    const { data } = await json("https://api.groq.com/openai/v1/models", { headers: bearer(key) }, deadline);
    if (!Array.isArray(data) || !data.some(entry => entry.id === model.model && entry.active !== false)) throw new ProviderFailure("INVALID_MODEL");
    return;
  }
  throw new ProviderFailure("UNKNOWN_PROVIDER");
}

const tokens = (x: unknown) => typeof x === "number" && Number.isInteger(x) && x >= 0 && x <= 1_000_000 ? x : 0;

export async function generateFree(model: Model, prompt: Prompt, deadline = Date.now() + 20_000) {
  const key = modelKey(model);
  await verifyFreeModel(model, key, deadline);
  let text: string | undefined;
  let inputTokens: unknown;
  let outputTokens: unknown;
  if (model.provider === "gemini") {
    const result = await json(`https://generativelanguage.googleapis.com/v1beta/models/${model.model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt.system }] },
        contents: prompt.messages.map((message, index) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }, ...(prompt.audio && index === prompt.messages.length - 1 ? [{ inlineData: prompt.audio }] : [])],
        })),
        generationConfig: { maxOutputTokens: prompt.maxTokens },
      }),
    }, deadline, 14_000);
    text = result.candidates?.[0]?.content?.parts?.map((part: { text?: string; thought?: boolean }) => part.thought ? "" : part.text ?? "").join("");
    inputTokens = result.usageMetadata?.promptTokenCount;
    outputTokens = result.usageMetadata?.candidatesTokenCount;
  } else if (model.provider === "groq" && !prompt.audio) {
    const result = await json("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: bearer(key),
      body: JSON.stringify({
        model: model.model,
        messages: [{ role: "system", content: prompt.system }, ...prompt.messages],
        service_tier: "on_demand",
        max_completion_tokens: prompt.maxTokens,
        ...(model.model.startsWith("openai/gpt-oss-") ? { reasoning_effort: "low" } : {}),
      }),
    }, deadline, 14_000);
    text = result.choices?.[0]?.message?.content;
    inputTokens = result.usage?.prompt_tokens;
    outputTokens = result.usage?.completion_tokens;
  } else if (model.provider === "openrouter" && !prompt.audio) {
    const result = await json("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: bearer(key),
      body: JSON.stringify({
        model: model.model,
        messages: [{ role: "system", content: prompt.system }, ...prompt.messages],
        max_completion_tokens: prompt.maxTokens,
        provider: { allow_fallbacks: false, max_price: { prompt: 0, completion: 0, request: 0 } },
      }),
    }, deadline, 14_000);
    const cost = result.usage?.cost;
    if ((typeof cost === "number" || typeof cost === "string") && Number(cost) > 0) {
      throw new ProviderFailure("NONZERO_COST");
    }
    if (cost !== 0 && !zeroPrice(cost)) throw new ProviderFailure("COST_UNVERIFIED");
    text = result.choices?.[0]?.message?.content;
    inputTokens = result.usage?.prompt_tokens;
    outputTokens = result.usage?.completion_tokens;
  } else {
    throw new ProviderFailure("UNSUPPORTED");
  }
  if (typeof text !== "string" || !text.trim()) throw new ProviderFailure("EMPTY_RESPONSE");
  return { text: filterOutput(text.trim()), inputTokens: tokens(inputTokens), outputTokens: tokens(outputTokens) };
}
