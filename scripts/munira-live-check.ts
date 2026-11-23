import assert from "node:assert/strict";
import { encryptSecret } from "../lib/crypto";
import { generateFree, ProviderFailure, type FreeProvider } from "../lib/munira/free-provider";
import { routeThroughFreeModels } from "../lib/munira/free-router";
import { localPricingAnswer, muniraPrompt } from "../lib/munira/context";

const scenarios = [
  ["محادثة عربية", "مرحبًا منيرة، اذكري خطوتين لإضافة منتج في لوحة التاجر."],
  ["وصف منتج", "اكتبي وصفًا عربيًا موجزًا لسلة خوص يدوية، قطرها 25 سم. استخدمي هذه المعلومات فقط."],
  ["محتوى تسويقي", "اكتبي سطرين لمنشور تسويقي عربي عن سلة خوص يدوية. تجنبي السعر والخصم والوعود غير المثبتة."],
] as const;

function candidate(provider: FreeProvider, modelName: string | undefined, key: string | undefined) {
  if (!key) return null;
  if (!modelName) throw new Error("MODEL_ID_REQUIRED");
  return { provider, model: modelName, apiKeyEnc: encryptSecret(key) };
}

async function main() {
  if (process.env.RUN_MUNIRA_LIVE !== "1") {
    throw new Error("RUN_MUNIRA_LIVE_REQUIRED");
  }
  const models = [
    candidate("openrouter", process.env.MUNIRA_OPENROUTER_MODEL, process.env.MUNIRA_OPENROUTER_API_KEY),
    candidate("gemini", process.env.MUNIRA_GEMINI_MODEL, process.env.MUNIRA_GEMINI_API_KEY),
  ].filter(model => model !== null);
  if (!models.length) throw new Error("PROVIDER_API_KEY_REQUIRED");
  const system = muniraPrompt("ar", "seller", []);
  for (const model of models) {
    for (const [name, content] of scenarios) {
      const answer = await generateFree(model, { system, messages: [{ role: "user", content }], maxTokens: 450 });
      assert.match(answer.text, /\p{Script=Arabic}/u);
      console.log(`${model.provider} · ${model.model} · ${name}: نجح. ${answer.inputTokens + answer.outputTokens} توكن.`);
    }
  }

  if (models.length === 2) {
    const [, backup] = models;
    const visited: string[] = [];
    const result = await routeThroughFreeModels(models, async model => {
      if (model !== backup) throw new ProviderFailure("HTTP_429");
      return generateFree(model, { system, messages: [{ role: "user", content: "أجيبي بالعربية بجملة ترحيب قصيرة." }], maxTokens: 120 });
    }, async (model) => {
      visited.push(model.provider);
    });
    assert.deepEqual(visited, ["openrouter", "gemini"]);
    assert.match(result.text, /\p{Script=Arabic}/u);
    console.log("التحويل الاحتياطي: استجابة فعلية من Gemini بعد محاكاة 429، دون استنفاد حدود OpenRouter.");
  }

  const prices = localPricingAnswer("تسعير تكلفة 45 هامش 25 رسوم 2");
  assert.match(prices ?? "", /اقتصادي:[\s\S]+متوازن:[\s\S]+مميز:/);
  console.log("التسعير الثلاثي: نجح الحساب المحلي دون اتصال بالمزود.");
}

main().catch(error => {
  // Never print provider bodies, request URLs, credentials, or raw exceptions.
  const code = error instanceof ProviderFailure ? error.code :
    error instanceof Error && /^[A-Z_]+$/.test(error.message) ? error.message : "CHECK_FAILED";
  console.error(`تعذّر إكمال التحقق المباشر (${code}).`);
  process.exitCode = 1;
});
