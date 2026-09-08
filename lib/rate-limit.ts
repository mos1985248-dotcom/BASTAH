// lib/rate-limit.ts
// تحديد معدّل الطلبات (Rate Limiting)
//
// ⚠️ قرار معماري مهم: لم نستخدم نظام "in-memory" بسيط (مثل Map في الذاكرة)
// لأن Vercel/serverless يشغّل كل طلب على instance منفصلة محتمَلة — الذاكرة
// لا تُشارَك بين الطلبات، فأي rate limiter في الذاكرة سيكون عشوائي الفعالية
// في الإنتاج (يعمل بالتطوير المحلي فقط وهذا مضلِّل). الحل الصحيح الوحيد في
// بيئة serverless هو تخزين العدّاد في مكان مشترك — Upstash Redis (REST API،
// لا يحتاج اتصال TCP دائم، مناسب لـ Vercel Edge/serverless).
//
// ⚠️ وضع التطوير بدون Upstash: لو UPSTASH_REDIS_REST_URL/TOKEN غير موجودين
// (مثلاً أول تشغيل محلي قبل ما تسوّي حساب Upstash)، كل الليميترات تتعطّل
// تلقائياً وتسمح بكل الطلبات (allowed: true دائماً) بدل ما ترمي خطأ توقف
// التطبيق بالكامل. بمجرد ما تضيفين المتغيّرين بـ.env، تشتغل الحدود الحقيقية
// تلقائياً من غير أي تعديل إضافي. **هذا السلوك مقصود فقط للتطوير المحلي —
// لا تنشري على الإنتاج بدون Upstash فعلي، لأن التحديد يكون معطّل بالكامل.**

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstashConfig = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (!hasUpstashConfig) {
  // مقصود: نطبع التحذير دائماً بغض النظر عن NODE_ENV — بالذات بالإنتاج
  // نحتاج الصوت الأعلى (console.error) لأن هذا يعني كل rate limiting
  // بالموقع معطّل بصمت (auth, checkout, AI, webhooks). ما نبي هالحالة
  // تمر بدون أي أثر بـ logs الإنتاج.
  const isProd = process.env.NODE_ENV === "production";
  const log = isProd ? console.error : console.warn;
  log(
    `${isProd ? "🔴" : "⚠️ "} [rate-limit] UPSTASH_REDIS_REST_URL/TOKEN غير موجودين — تحديد معدّل الطلبات معطّل بالكامل (كل الطلبات مسموحة، بلا حدود). ` +
    (isProd
      ? "هذا يحدث بالإنتاج الآن! أضيفي المتغيّرين بأقرب وقت — auth وcheckout وAI وwebhooks كلها بدون حماية من الإغراق."
      : "هذا مقبول للتطوير المحلي فقط. أضيفي المتغيّرين بـ.env.local لتفعيله.")
  );
}

const redis = hasUpstashConfig
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  : null;

function makeLimiter(limiter: ReturnType<typeof Ratelimit.slidingWindow>, prefix: string): Ratelimit | null {
  return redis ? new Ratelimit({ redis, limiter, prefix }) : null;
}

// حدود مختلفة حسب حساسية المسار
export const authRateLimit = makeLimiter(Ratelimit.slidingWindow(5, "60 s"), "ratelimit:auth"); // 5 محاولات/دقيقة — تسجيل دخول، نسيت كلمة المرور
export const apiRateLimit = makeLimiter(Ratelimit.slidingWindow(60, "60 s"), "ratelimit:api"); // 60 طلب/دقيقة — عام
export const aiRateLimit = makeLimiter(Ratelimit.slidingWindow(15, "60 s"), "ratelimit:ai"); // 15 طلب/دقيقة — منيرة (مكلفة: Claude + Whisper + fal.ai)
export const webhookRateLimit = makeLimiter(Ratelimit.slidingWindow(100, "60 s"), "ratelimit:webhook");

// ── Role-aware AI rate limits (daily quotas) ──────────────
// IP-only كان كافياً للـ API العام، لكن AI calls مكلفة ولا يجب مشاركة
// الـ quota بين roles مختلفة. اليوم = 24 ساعة كنافذة زمنية.
const aiGuestLimit = makeLimiter(Ratelimit.slidingWindow(5, "24 h"), "ratelimit:ai:guest"); // 5 رسائل/يوم — زائر بدون حساب
const aiBuyerLimit = makeLimiter(Ratelimit.slidingWindow(20, "24 h"), "ratelimit:ai:buyer"); // 20 رسائل/يوم — مشتري مسجّل
const aiSellerLimit = makeLimiter(Ratelimit.slidingWindow(100, "24 h"), "ratelimit:ai:seller"); // 100 رسائل/يوم — بائع (GROWTH/PRO)
const aiAdminLimit = makeLimiter(Ratelimit.slidingWindow(500, "24 h"), "ratelimit:ai:admin"); // 500 — إدارة بدون قيود عملية

type AIUserRole = "guest" | "buyer" | "seller" | "admin";

/**
 * يرجع الـ rate limiter المناسب للدور مع المفتاح الصحيح.
 * المفتاح: userId للمسجّلين، IP للزوّار — يمنع تجاوز الحد بتغيير الـ IP.
 */
export async function checkAiRateLimit(
  role: AIUserRole,
  identifier: string // userId أو IP
): Promise<RateLimitResult> {
  const limiterMap: Record<AIUserRole, Ratelimit | null> = {
    guest: aiGuestLimit,
    buyer: aiBuyerLimit,
    seller: aiSellerLimit,
    admin: aiAdminLimit,
  };
  const limiter = limiterMap[role] ?? aiGuestLimit;
  return checkRateLimit(limiter, identifier);
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * يحدد معدل الطلبات بمفتاح (عادة IP أو userId).
 * لو limiter كان null (Upstash غير مُعدّ)، يسمح بالطلب دائماً — راجعي
 * التنويه بأعلى الملف.
 * الاستخدام في middleware.ts أو أي route:
 *   const { allowed } = await checkRateLimit(apiRateLimit, ip);
 *   if (!allowed) return new Response("Too many requests", { status: 429 });
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { allowed: true, remaining: 999999, resetAt: 0 };
  }
  const { success, remaining, reset } = await limiter.limit(key);
  return { allowed: success, remaining, resetAt: reset };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
  };
}
