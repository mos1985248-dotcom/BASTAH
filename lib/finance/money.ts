// lib/finance/money.ts
// المبالغ تُحسب بالهللات (أعداد صحيحة) لتجنب أخطاء الكسور العشرية. الريال = 100 هللة.
// القيم القادمة من Prisma قد تكون Decimal أو number أو string فنحوّلها كلها بأمان.

export type Moneyish = number | string | { toString(): string } | null | undefined;

/** يحوّل مبلغاً بالريال إلى هللات صحيحة (تقريب لأقرب هللة، نصف لأعلى). null إن لم يكن رقماً صالحاً. */
export function toMinor(value: Moneyish): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value.toString());
  if (!Number.isFinite(n)) return null;
  // نمرّ عبر نص بأربع خانات ثم نقسم عدداً صحيحاً على 100 فلا يُخطئ مثل 1.005*100 = 100.49999
  const digits = Math.abs(n).toFixed(4).replace(".", "");
  return (n < 0 ? -1 : 1) * Math.round(Number(digits) / 100);
}

export const fromMinor = (minor: number): number => Math.round(minor) / 100;

/** عرض نصي بالريال بخانتين (للتصدير والواجهة). */
export function formatSar(minor: number): string {
  const neg = minor < 0;
  const abs = Math.abs(Math.round(minor));
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${neg ? "-" : ""}${whole}.${frac}`;
}

/** الدولار بدقة ميكرو (1e-6) لتكلفة الذكاء الاصطناعي. */
export function toMicroUsd(value: Moneyish): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(n) ? Math.round(n * 1_000_000) : null;
}

export const microUsdToUsd = (micro: number): number => micro / 1_000_000;

/** تحويل دولار → هللات بسعر صرف موثَّق (ريال/دولار). null إن لم يتوفر السعر — لا تقدير هنا. */
export function usdMicroToSarMinor(micro: number, sarPerUsd: number | null): number | null {
  if (sarPerUsd === null || !Number.isFinite(sarPerUsd) || sarPerUsd <= 0) return null;
  return Math.round((micro / 1_000_000) * sarPerUsd * 100);
}

export const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
