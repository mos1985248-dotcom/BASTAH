// lib/ai/provider.ts
// طبقة المزوّد المستقلة — كل منطق Munira (security, prompt, persistence)
// يستدعي هذا الملف فقط. لو تغيّر المزوّد (Claude → Gemini) أو أُضيف مزوّد
// ثانٍ، يتغيّر هذا الملف وحده دون لمس أي route أو lib أخرى.

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { filterOutput } from "@/lib/munira/security";

// ── ثوابت المزوّد الافتراضي (قابلة للتوسعة لمتغيّر بيئة) ──
const DEFAULT_PROVIDER = "anthropic";
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// تكلفة تقديرية لـ claude-sonnet-4 (بالدولار لكل مليون token)
// يُحدَّث هنا فقط لو تغيّر التسعير — مرجع واحد للحساب
const COST_PER_1M: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "whisper-1": { input: 0.006, output: 0 }, // per minute, approximate
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = COST_PER_1M[model];
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

// ── AIUsage logger ────────────────────────────────────────
export async function logAIUsage(params: {
  userId?: string;
  storeId?: string;
  provider: string;
  model: string;
  feature: string;
  route: string;
  inputTokens: number;
  outputTokens: number;
  sessionId?: string;
  durationMs?: number;
  success?: boolean;
  errorMessage?: string;
}) {
  const totalTokens = params.inputTokens + params.outputTokens;
  const estimatedCostUsd = estimateCost(params.model, params.inputTokens, params.outputTokens);
  prisma.aIUsage.create({
    data: {
      ...params,
      totalTokens,
      estimatedCostUsd,
      success: params.success ?? true,
      errorMessage: params.errorMessage ?? null,
    },
  }).catch((err) => console.error("[ai-usage-log-failed]", err));
}

// ── Chat Stream Interface ─────────────────────────────────
interface StreamChatParams {
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
  model?: string;
  maxTokens?: number;
  userId?: string;
  storeId?: string;
  sessionId?: string;
  route: string;
  feature: string;
}

/**
 * يُنشئ ReadableStream من Claude (أو أي مزوّد آخر مستقبلاً) مع:
 * - فلترة المخرجات (security)
 * - تسجيل AIUsage تلقائياً بعد انتهاء الـ stream
 * - الـ stream يُرسَل مباشرة للعميل (SSE-like)
 */
export function createChatStream(params: StreamChatParams): ReadableStream {
  const model = params.model ?? DEFAULT_MODEL;
  const maxTokens = params.maxTokens ?? 1024;
  const encoder = new TextEncoder();
  const startTime = Date.now();

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let fullResponse = "";

  return new ReadableStream({
    async start(controller) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

        const stream = await anthropic.messages.stream({
          model,
          max_tokens: maxTokens,
          system: params.systemPrompt,
          messages: params.messages,
        });

        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const filtered = filterOutput(chunk.delta.text);
            fullResponse += filtered;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta: { text: filtered } })}\n\n`)
            );
          }
          // استخراج usage من final message
          if (chunk.type === "message_delta" && chunk.usage) {
            totalOutputTokens = chunk.usage.output_tokens;
          }
          if (chunk.type === "message_start" && chunk.message.usage) {
            totalInputTokens = chunk.message.usage.input_tokens;
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        // تسجيل الاستخدام بعد انتهاء الـ stream
        logAIUsage({
          userId: params.userId,
          storeId: params.storeId,
          provider: DEFAULT_PROVIDER,
          model,
          feature: params.feature,
          route: params.route,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          sessionId: params.sessionId,
          durationMs: Date.now() - startTime,
        });
      } catch (err) {
        console.error("[ai-provider-stream-error]", err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "حدث خطأ أثناء معالجة الردّ" })}\n\n`)
        );
        controller.close();
      }
    },
  });
}

/**
 * استدعاء عادي (غير streaming) — للترجمة والمهام غير التفاعلية.
 * يرجع النص الكامل ويُسجّل الاستخدام.
 */
export async function callAI(params: {
  systemPrompt?: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  userId?: string;
  storeId?: string;
  route: string;
  feature: string;
}): Promise<string> {
  const model = params.model ?? DEFAULT_MODEL;
  const startTime = Date.now();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const response = await anthropic.messages.create({
    model,
    max_tokens: params.maxTokens ?? 1024,
    ...(params.systemPrompt ? { system: params.systemPrompt } : {}),
    messages: [{ role: "user", content: params.prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as any).text)
    .join("");

  logAIUsage({
    userId: params.userId,
    storeId: params.storeId,
    provider: DEFAULT_PROVIDER,
    model,
    feature: params.feature,
    route: params.route,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    durationMs: Date.now() - startTime,
  });

  return filterOutput(text);
}

// ── Voice Transcription (Whisper) ─────────────────────────
// Whisper يُستدعى هنا وليس من الـ route مباشرة. لو تغيّر مزوّد STT
// (Deepgram، Google Speech، local Whisper) يُعدَّل هنا فقط.
export async function transcribeAudio(params: {
  audioFile: File;
  userId?: string;
  storeId?: string;
  route: string;
}): Promise<{ transcript: string; whisperLanguage: string | null }> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const startTime = Date.now();

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: params.audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    const transcript = transcription.text?.trim() ?? "";
    const whisperLanguage = (transcription as any).language ?? null;

    logAIUsage({
      userId: params.userId,
      storeId: params.storeId,
      provider: "openai",
      model: "whisper-1",
      feature: "voice",
      route: params.route,
      inputTokens: 0,
      outputTokens: 0,
      durationMs: Date.now() - startTime,
      success: true,
    });

    return { transcript, whisperLanguage };
  } catch (err: any) {
    logAIUsage({
      userId: params.userId,
      storeId: params.storeId,
      provider: "openai",
      model: "whisper-1",
      feature: "voice",
      route: params.route,
      inputTokens: 0,
      outputTokens: 0,
      durationMs: Date.now() - startTime,
      success: false,
      errorMessage: String(err?.message ?? err),
    });
    throw err;
  }
}
