import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes } from "node:crypto";
import { encryptSecret } from "../../lib/crypto";
import { generateFree, groqServerKeyRef, isFreeOpenRouterModel, ProviderFailure } from "../../lib/munira/free-provider";
import { routeThroughFreeModels } from "../../lib/munira/free-router";
import { localPricingAnswer, muniraPrompt, redactPrompt } from "../../lib/munira/context";
import { quotaWindow } from "../../lib/munira/quota";

const model = { provider: "openrouter", model: "example/model:free", apiKeyEnc: "" };
const secondary = { ...model, model: "example/other:free" };

test("only accepts exact free model IDs with zero catalog pricing", () => {
  const free = { id: model.model, pricing: { prompt: "0.00", completion: "0", request: "0" } };
  assert.equal(isFreeOpenRouterModel(free, model.model), true);
  assert.equal(isFreeOpenRouterModel({ ...free, pricing: { ...free.pricing, request: "0.0001" } }, model.model), false);
  assert.equal(isFreeOpenRouterModel({ ...free, pricing: { prompt: "0" } }, model.model), false);
  assert.equal(isFreeOpenRouterModel({ ...free, id: "example/model" }, "example/model"), false);
});

test("uses zero-cost-only routing and handles an Arabic response via the official API shape", async (t) => {
  process.env.ENCRYPTION_KEY ??= randomBytes(32).toString("base64");
  const paths: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, options?: RequestInit) => {
    paths.push(new URL(url).pathname);
    if (paths.at(-1)?.endsWith("/models")) return Response.json({ data: [{ id: model.model, pricing: { prompt: "0", completion: "0" } }] });
    if (paths.at(-1)?.endsWith("/key")) return Response.json({ data: { is_free_tier: true } });
    const body = JSON.parse(String(options?.body));
    assert.equal(body.model, model.model);
    assert.equal(body.provider.allow_fallbacks, false);
    assert.deepEqual(body.provider.max_price, { prompt: 0, completion: 0, request: 0 });
    return Response.json({ choices: [{ message: { content: "أهلًا، كيف أساعدك؟" } }], usage: { prompt_tokens: 7, completion_tokens: 4, cost: 0 } });
  });
  const secured = { ...model, apiKeyEnc: encryptSecret(randomBytes(24).toString("hex")) };
  const prompt = { system: "أجب بالعربية.", messages: [{ role: "user" as const, content: "مرحبا" }], maxTokens: 60 };
  assert.deepEqual(await generateFree(secured, prompt), { text: "أهلًا، كيف أساعدك؟", inputTokens: 7, outputTokens: 4 });
  assert.deepEqual(paths, ["/api/v1/models", "/api/v1/key", "/api/v1/chat/completions"]);
  await assert.rejects(() => generateFree({ ...secured, model: "example/paid" }, prompt), { code: "MODEL_NOT_FREE" });
  assert.equal(paths.length, 3);
});

test("fails over after 429 and changing the order changes the primary model", async () => {
  const called: string[] = [];
  const log: (string | null)[] = [];
  const answer = async (config: typeof model) => {
    called.push(config.model);
    if (config.model === model.model) throw new ProviderFailure("HTTP_429");
    return { text: "مرحبًا بك", inputTokens: 3, outputTokens: 4 };
  };
  const record = async (_model: typeof model, _result: unknown, error: string | null) => { log.push(error); };
  assert.equal((await routeThroughFreeModels([model, secondary], answer, record)).text, "مرحبًا بك");
  assert.deepEqual(called, [model.model, secondary.model]);
  assert.deepEqual(log, ["HTTP_429", null]);
  called.length = 0;
  await routeThroughFreeModels([secondary, model], answer, record);
  assert.deepEqual(called, [secondary.model]);
  await assert.rejects(() => routeThroughFreeModels([model], answer, record), { code: "FREE_MODELS_UNAVAILABLE" });
});

test("trial stays once per shop and monthly quotas switch at Riyadh midnight", () => {
  const before = new Date("2026-11-30T20:59:59Z");
  const after = new Date("2026-11-30T21:00:00Z");
  assert.deepEqual(quotaWindow(0, 0, before), { key: "2026-11", limit: 0 });
  assert.deepEqual(quotaWindow(0, 5, before), quotaWindow(0, 5, after));
  assert.deepEqual(quotaWindow(100, 0, before), { key: "2026-11", limit: 100 });
  assert.deepEqual(quotaWindow(200, 0, after), { key: "2026-12", limit: 200 });
});

test("redacts unnecessary sensitive input and uses the pricing engine directly", () => {
  const sanitized = redactPrompt("a@example.test +966 555 123 456 SA0000000000000000000000");
  assert.equal(sanitized.includes("@"), false);
  assert.equal(sanitized.includes("966"), false);
  assert.equal(sanitized.includes("SA000"), false);
  const quotes = localPricingAnswer("تسعير تكلفة ٤٥ هامش ٢٥ رسوم ٢") ?? "";
  assert.match(quotes, /اقتصادي: 57\.69/);
  assert.match(quotes, /متوازن: 61\.64/);
  assert.match(quotes, /مميز: 66\.18/);
  assert.match(quotes, /ربح الوحدة المتوقع/);
  assert.equal(localPricingAnswer("كيف أضيف منتجاً؟"), null);
  assert.ok(muniraPrompt("ar", "seller", ["x".repeat(5000)]).length < 650);
});

test("fails closed for Groq inventory and Gemini without billing proof", async (t) => {
  process.env.ENCRYPTION_KEY ??= randomBytes(32).toString("base64");
  const apiKeyEnc = encryptSecret(randomBytes(24).toString("hex"));
  const settings = { system: "أجب بالعربية.", messages: [{ role: "user" as const, content: "مرحبًا" }], maxTokens: 24 };
  let requests = 0;
  t.mock.method(globalThis, "fetch", async (url: string) => {
    requests++;
    assert.equal(new URL(url).hostname, "api.groq.com");
    assert.ok(url.endsWith("/models"));
    return Response.json({ data: [{ id: "visible", active: true }] });
  });
  await assert.rejects(() => generateFree({ provider: "groq", model: "visible", apiKeyEnc }, settings), { code: "BILLING_UNVERIFIED" });
  await assert.rejects(() => generateFree({ provider: "gemini", model: "visible", apiKeyEnc }, settings), { code: "BILLING_UNVERIFIED" });
  assert.equal(requests, 0);
});

test("blocks a billed OpenRouter account before sending its prompt", async (t) => {
  process.env.ENCRYPTION_KEY ??= randomBytes(32).toString("base64");
  const apiKeyEnc = encryptSecret(randomBytes(24).toString("hex"));
  const calls: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    const path = new URL(url).pathname;
    calls.push(path);
    if (path.endsWith("/models")) return Response.json({ data: [{ id: model.model, pricing: { prompt: "0", completion: "0" } }] });
    return Response.json({ data: { is_free_tier: false } });
  });
  await assert.rejects(() => generateFree({ ...model, apiKeyEnc }, {
    system: "أجب بالعربية", messages: [{ role: "user", content: "مرحبا" }], maxTokens: 24,
  }), { code: "BILLING_UNVERIFIED" });
  assert.deepEqual(calls, ["/api/v1/models", "/api/v1/key"]);
});

test("Groq only uses the owner-confirmed server credential and on-demand tier", async t => {
  t.mock.method(globalThis, "fetch", async (url: string, options?: RequestInit) => {
    if (url.endsWith("/models")) return Response.json({ data: [{ id: "openai/gpt-oss-20b", active: true }] });
    assert.equal(new URL(url).hostname, "api.groq.com");
    const payload = JSON.parse(String(options?.body));
    assert.equal(payload.service_tier, "on_demand");
    assert.equal(payload.model, "openai/gpt-oss-20b");
    return Response.json({ choices: [{ message: { content: "مرحبًا من Groq" } }], usage: { prompt_tokens: 7, completion_tokens: 4 } });
  });
  const originalKey = process.env.GROQ_API_KEY;
  const originalApproval = process.env.MUNIRA_GROQ_FREE_TIER_CONFIRMED;
  t.after(() => {
    if (originalKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = originalKey;
    if (originalApproval === undefined) delete process.env.MUNIRA_GROQ_FREE_TIER_CONFIRMED;
    else process.env.MUNIRA_GROQ_FREE_TIER_CONFIRMED = originalApproval;
  });
  process.env.GROQ_API_KEY = randomBytes(16).toString("hex");
  delete process.env.MUNIRA_GROQ_FREE_TIER_CONFIRMED;
  const configured = { provider: "groq", model: "openai/gpt-oss-20b", apiKeyEnc: groqServerKeyRef };
  const prompt = { system: "أجب بالعربية", messages: [{ role: "user" as const, content: "مرحبًا" }], maxTokens: 60 };
  await assert.rejects(() => generateFree(configured, prompt), { code: "BILLING_UNVERIFIED" });
  process.env.MUNIRA_GROQ_FREE_TIER_CONFIRMED = "true";
  assert.deepEqual(await generateFree(configured, prompt), { text: "مرحبًا من Groq", inputTokens: 7, outputTokens: 4 });
});
