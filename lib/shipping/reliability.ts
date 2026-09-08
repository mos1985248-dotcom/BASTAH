// lib/shipping/reliability.ts
// طبقة موحّدة لإعادة المحاولة — تُستخدم من ShippingService فقط (لا تكرار
// لهذا المنطق داخل كل Provider). التوقيت (timeout) نفسه يُضبط داخل كل
// Provider مباشرة عبر AbortSignal.timeout() على استدعاء fetch (أبسط
// وأدق من تمرير signal عبر طبقات — Node 18+ يدعمه أصلاً بدون أي حزمة).

import { ShippingProviderError, ShippingErrorReason } from "./types";

/** مهلة موحّدة لأي استدعاء شبكي لشركة شحن — كانت غائبة كلياً سابقاً (نتيجة أساسية بالـAudit) */
export const SHIPPING_FETCH_TIMEOUT_MS = 10_000;

// لا تستحق إعادة المحاولة: بيانات اعتماد خاطئة، طلب غير صالح، أو قدرة
// غير مدعومة أصلاً — إعادة المحاولة هنا مضيعة وقت فقط وقد تُغرق حساب
// التاجر عند شركة الشحن (rate limiting/lockout محتمل)
const RETRYABLE_REASONS: ShippingErrorReason[] = ["timeout", "network", "unavailable"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  retries?: number;      // عدد المحاولات الإضافية بعد الأولى (افتراضي 2)
  baseDelayMs?: number;  // تأخير المحاولة الأولى؛ يتضاعف بعدها (exponential backoff)
}

/** يُنفّذ fn، ويعيد المحاولة فقط للأخطاء القابلة للتكرار منطقياً (شبكة/مهلة/عدم توفر مؤقت) */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = opts.retries ?? 2;
  const baseDelayMs = opts.baseDelayMs ?? 400;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isRetryable = err instanceof ShippingProviderError && RETRYABLE_REASONS.includes(err.reason);
      if (!isRetryable || attempt === retries) throw err;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
  throw lastErr;
}

/** يُحوّل أي استثناء غير مُطبَّع (شبكة/JS عام) لـShippingProviderError مُصنَّف — نقطة تطبيع موحّدة */
export function normalizeShippingError(err: unknown, carrier: string): ShippingProviderError {
  if (err instanceof ShippingProviderError) return err;
  if (err instanceof Error && err.name === "TimeoutError") {
    return new ShippingProviderError(`انتهت مهلة الاتصال بشركة الشحن (${carrier})`, carrier, "timeout");
  }
  const message = err instanceof Error ? err.message : "خطأ غير معروف بخدمة الشحن";
  return new ShippingProviderError(message, carrier, "unknown");
}
