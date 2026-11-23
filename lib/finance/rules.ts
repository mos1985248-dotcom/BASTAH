// lib/finance/rules.ts — قواعد نقية تتشاركها الخدمات والاختبارات: حدود التسويات والاستردادات، وتوزيع التسويات، وحصة COD.
import { toMinor } from "./money";

export interface RuleResult { ok: boolean; reason?: string }

/** لا تسوية بمبلغ أكبر من المستحق المتبقي ولا بمبلغ غير موجب. */
export function validateSettlementAmount(amountMinor: number, outstandingMinor: number): RuleResult {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) return { ok: false, reason: "المبلغ يجب أن يكون موجباً" };
  if (amountMinor > outstandingMinor) return { ok: false, reason: "المبلغ يتجاوز المستحق المتبقي. إن كان تصحيحاً فسجّل قيداً عكسياً." };
  return { ok: true };
}

/** الاسترداد لا يتجاوز ما دُفع فعلاً ناقص ما استُرد سابقاً. */
export function validateRefund(paidGrossMinor: number, alreadyRefundedMinor: number, amountMinor: number): RuleResult {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) return { ok: false, reason: "مبلغ الاسترداد يجب أن يكون موجباً" };
  if (amountMinor > paidGrossMinor - alreadyRefundedMinor) return { ok: false, reason: "مبلغ الاسترداد يتجاوز المدفوع المتبقي للفاتورة" };
  return { ok: true };
}

export interface DueItem { shipmentId: string; dueMinor: number; allocatedMinor: number; deliveredAt: Date }
export interface Allocation { shipmentId: string; amountMinor: number }

/** يوزّع مبلغ التسوية على المستحقات الأقدم أولاً دون تجاوز المتبقي لأي شحنة. يرجع null إن زاد المبلغ عن المجموع. */
export function allocateOldestFirst(amountMinor: number, items: DueItem[]): Allocation[] | null {
  let left = amountMinor;
  const out: Allocation[] = [];
  for (const it of [...items].sort((a, b) => a.deliveredAt.getTime() - b.deliveredAt.getTime())) {
    if (left <= 0) break;
    const remaining = it.dueMinor - it.allocatedMinor;
    if (remaining <= 0) continue;
    const take = Math.min(left, remaining);
    out.push({ shipmentId: it.shipmentId, amountMinor: take });
    left -= take;
  }
  return left > 0 ? null : out;
}

export interface CodTerms { carrierKey: string; fixedShare: number | null; percentShare: number | null; percentBasis: "FIXED_ONLY" | "ORDER_TOTAL" | "COD_FEE" | null; effectiveFrom: Date }

/** الشروط السارية وقت الطلب: أحدث effectiveFrom ≤ وقت الطلب لهذا الناقل. */
export function pickTerms(all: CodTerms[], carrierKey: string, at: Date): CodTerms | null {
  return all.filter((t) => t.carrierKey === carrierKey && t.effectiveFrom <= at).sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0] ?? null;
}

/**
 * حصة شركة الشحن من رسم COD بالهللات. null = إعداد التكلفة ناقص (لا نخترع حصة).
 * النسبة تتطلب أساساً صريحاً (إجمالي الطلب أو رسم COD) — لا نفترض أيّهما.
 */
export function codCarrierShareMinor(terms: CodTerms | null, orderTotalMinor: number, codFeeMinor: number): number | null {
  if (!terms) return null;
  const fixed = terms.fixedShare !== null ? toMinor(terms.fixedShare) : 0;
  let pct = 0;
  if (terms.percentShare !== null) {
    if (terms.percentBasis !== "ORDER_TOTAL" && terms.percentBasis !== "COD_FEE") return null;
    const base = terms.percentBasis === "ORDER_TOTAL" ? orderTotalMinor : codFeeMinor;
    pct = Math.round((base * terms.percentShare) / 100);
  }
  if (fixed === null) return null;
  return Math.max(0, fixed + pct);
}
