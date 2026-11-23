// components/admin/finance/format.ts — تنسيق المبالغ والنسب (أرقام لاتينية كبقية الموقع).
export const sar = (minor: number | null | undefined): string =>
  minor === null || minor === undefined ? "غير متاح" : `${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

export const usd = (micro: number | null | undefined): string =>
  micro === null || micro === undefined ? "غير متاح" : `$${(micro / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

export const pct = (v: number | null | undefined): string => (v === null || v === undefined ? "—" : `${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`);

export const MONTH_NAMES = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
export const monthName = (m: number) => MONTH_NAMES[m - 1] ?? String(m);

export const dateOnly = (v: string | Date): string => new Date(v).toISOString().slice(0, 10);
export const newKey = (): string => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k${Date.now()}${Math.random().toString(36).slice(2, 10)}`);
