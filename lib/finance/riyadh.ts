// lib/finance/riyadh.ts
// حدود الشهر بتوقيت الرياض (UTC+3 ثابت، بلا توقيت صيفي). التواريخ تُخزَّن UTC وتُقاس هنا بالرياض.

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

export interface MonthKey { year: number; month: number } // month: 1–12

/** بداية الشهر (شاملة) ونهايته (حصرية) كـUTC. */
export function monthRangeUtc({ year, month }: MonthKey): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1) - RIYADH_OFFSET_MS);
  const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1) - RIYADH_OFFSET_MS);
  return { start, end };
}

/** الشهر (بتوقيت الرياض) الذي يقع فيه هذا التاريخ. */
export function riyadhMonthOf(date: Date): MonthKey {
  const shifted = new Date(date.getTime() + RIYADH_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

export const sameMonth = (a: MonthKey, b: MonthKey) => a.year === b.year && a.month === b.month;

export function inMonth(date: Date | null | undefined, key: MonthKey): boolean {
  if (!date) return false;
  const { start, end } = monthRangeUtc(key);
  return date >= start && date < end;
}

export function previousMonth({ year, month }: MonthKey): MonthKey {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

/** آخر n شهراً تنتهي بالشهر المعطى (الأقدم أولاً). */
export function lastMonths(end: MonthKey, n: number): MonthKey[] {
  const out: MonthKey[] = [end];
  while (out.length < n) out.unshift(previousMonth(out[0]));
  return out;
}

export const monthLabel = ({ year, month }: MonthKey) => `${year}-${String(month).padStart(2, "0")}`;

/** يزيح الشهر بعدد أشهر موجب أو سالب. */
export function shiftMonth({ year, month }: MonthKey, delta: number): MonthKey {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12 + 12) % 12 + 1 };
}
