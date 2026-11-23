// lib/finance/shipping.ts — مستحقات بسطة من الشحن الخارجي والمحلي ورسوم COD، وأرصدة المناديب.
// القاعدة: لا إيراد بمجرد إنشاء الطلب؛ الاستحقاق عند التسليم (DELIVERED) لطلب غير ملغى/مسترد.
// حصة الناقل وقيمة الشحن المارة عبر المنصة ليستا إيراداً. القيم التاريخية فقط تدخل المجاميع.
import { sum } from "./money";
import { inMonth, type MonthKey, monthRangeUtc } from "./riyadh";
import type { CourierLine, DueLine, Flag, MonthlySummary, SettlementIn, SettlementKind, ShipmentIn } from "./types";

const EXCLUDED_ORDER_STATUSES = new Set(["CANCELLED", "REFUNDED"]);

export const isEligible = (s: ShipmentIn) => s.status === "DELIVERED" && !!s.deliveredAt && !EXCLUDED_ORDER_STATUSES.has(s.orderStatus);

/** أول شحنة مسلَّمة لكل طلب — يمنع تكرار الرسوم في الطلبات متعددة الشحنات. */
export function firstPerOrder(list: ShipmentIn[]): ShipmentIn[] {
  const byOrder = new Map<string, ShipmentIn>();
  for (const s of list) {
    const prev = byOrder.get(s.orderId);
    if (!prev || (s.deliveredAt as Date) < (prev.deliveredAt as Date)) byOrder.set(s.orderId, s);
  }
  return [...byOrder.values()];
}

/** مجموع التسويات الفعلي: القيد العكسي يُنقص. */
export function settled(list: SettlementIn[], kind: SettlementKind, filter?: (s: SettlementIn) => boolean): number {
  return sum(list.filter((s) => s.kind === kind && (!filter || filter(s))).map((s) => (s.isReversal ? -s.amountMinor : s.amountMinor)));
}

const dueLine = (accruedMonth: number, accruedCum: number, receivedMonth: number, receivedCum: number, eligibleCount: number, undocumentedCount: number): DueLine => ({
  accruedMinor: accruedMonth, receivedMinor: receivedMonth, outstandingMinor: accruedCum - receivedCum, eligibleCount, undocumentedCount,
});

export function computeShipping(
  shipments: ShipmentIn[], settlements: SettlementIn[], month: MonthKey, failedOrReturned: number, courierNames: Record<string, string>,
): { external: MonthlySummary["external"]; local: MonthlySummary["local"]; cod: MonthlySummary["cod"]; couriers: MonthlySummary["couriers"]; flags: Flag[] } {
  const flags: Flag[] = [];
  const { end } = monthRangeUtc(month);
  const delivered = shipments.filter((s) => isEligible(s) && (s.deliveredAt as Date) < end);
  const monthOnly = <T extends ShipmentIn>(xs: T[]) => xs.filter((s) => inMonth(s.deliveredAt, month));
  const inSettleMonth = (s: SettlementIn) => inMonth(s.settledAt, month);

  // ── الشحن الخارجي (عمولة بسطة = basitaFee المحفوظة وقت الشراء) ──
  const external = firstPerOrder(delivered.filter((s) => !s.courierId));
  const extMonth = monthOnly(external);
  const extDoc = (xs: ShipmentIn[]) => xs.filter((s) => s.basitaFeeMinor !== null);
  const extUndocumented = extMonth.length - extDoc(extMonth).length;
  const externalOut = {
    ...dueLine(
      sum(extDoc(extMonth).map((s) => s.basitaFeeMinor as number)), sum(extDoc(external).map((s) => s.basitaFeeMinor as number)),
      settled(settlements.filter(inSettleMonth), "COMMISSION_RECEIPT"), settled(settlements, "COMMISSION_RECEIPT"),
      extMonth.length, extUndocumented,
    ),
    passThroughNote: "حصة الناقل وتكلفة الشحن المارة عبر المنصة ليستا إيراداً لبسطة.",
  };
  if (extUndocumented > 0) flags.push({ code: "EXTERNAL_NO_FEE_SNAPSHOT", severity: "WARN", count: extUndocumented, message: "شحنات خارجية بلا قيمة عمولة محفوظة؛ لم تدخل المجاميع." });

  // ── بسطة للشحن (محلي) ──
  const local = delivered.filter((s) => !!s.courierId);
  const localMonth = monthOnly(local);
  const documented = (s: ShipmentIn) => !!s.assignment && s.assignment.deliveryFeeMinor !== null && s.assignment.wageMinor !== null;
  const docMonth = localMonth.filter(documented);
  const undocMonth = localMonth.filter((s) => !documented(s));
  const fee = sum(docMonth.map((s) => s.assignment!.deliveryFeeMinor as number));
  const wages = sum(docMonth.map((s) => s.assignment!.wageMinor as number));
  const direct = sum(docMonth.map((s) => s.assignment!.directCostMinor ?? 0));
  const estimable = undocMonth.filter((s) => s.courierCurrentWageMinor !== null);
  const localOut = {
    ...dueLine(
      fee, sum(local.filter(documented).map((s) => s.assignment!.deliveryFeeMinor as number)),
      settled(settlements.filter(inSettleMonth), "LOCAL_DELIVERY_RECEIPT"), settled(settlements, "LOCAL_DELIVERY_RECEIPT"),
      localMonth.length, undocMonth.length,
    ),
    deliveryFeeMinor: fee, courierWagesMinor: wages, directCostMinor: direct, marginMinor: fee - wages - direct,
    estimatedAtCurrentRates: { count: estimable.length, marginMinor: sum(estimable.map((s) => s.orderShippingCostMinor - (s.courierCurrentWageMinor as number))) },
    failedOrReturned,
  };
  if (undocMonth.length > 0) flags.push({ code: "LOCAL_UNDOCUMENTED", severity: "WARN", count: undocMonth.length, message: "شحنات محلية بلا قيم تاريخية (قبل تثبيت القيم): «غير موثقة»، وتقديرها بالقيم الحالية منفصل ولا يدخل المجاميع." });

  // ── رسوم COD (مرة واحدة لكل طلب، وحصة الناقل من لقطة الطلب فقط) ──
  const codAll = firstPerOrder(delivered).filter((s) => s.paymentMethod === "CASH_ON_DELIVERY" && s.codFeeMinor > 0);
  const codMonth = monthOnly(codAll);
  const codComplete = (xs: ShipmentIn[]) => xs.filter((s) => s.codCarrierShareMinor !== null);
  const netOf = (xs: ShipmentIn[]) => sum(codComplete(xs).map((s) => s.codFeeMinor - (s.codCarrierShareMinor as number)));
  const codIncomplete = codMonth.length - codComplete(codMonth).length;
  const codOut = {
    eligibleCount: codMonth.length,
    customerFeesGrossMinor: sum(codMonth.map((s) => s.codFeeMinor)),
    carrierSharesMinor: sum(codComplete(codMonth).map((s) => s.codCarrierShareMinor as number)),
    netShareMinor: netOf(codMonth),
    incompleteCount: codIncomplete,
    receivedMinor: settled(settlements.filter(inSettleMonth), "COD_SHARE_RECEIPT"),
    outstandingMinor: netOf(codAll) - settled(settlements, "COD_SHARE_RECEIPT"),
  };
  if (codIncomplete > 0) flags.push({ code: "COD_COST_SETUP_INCOMPLETE", severity: "WARN", count: codIncomplete, message: "طلبات COD بلا حصة ناقل محفوظة: إعداد التكلفة ناقص، فلم يُحتسب صافي حصة بسطة منها." });

  // ── المناديب: أرصدة تراكمية حتى نهاية الشهر؛ المستحق والمدفوع للشهر في المجاميع ──
  const lines: CourierLine[] = [];
  const ids = new Set<string>([...local.map((s) => s.courierId as string), ...settlements.filter((s) => s.kind === "COURIER_PAYOUT").map((s) => s.partyRef)]);
  for (const id of ids) {
    const mine = local.filter((s) => s.courierId === id);
    const acc = sum(mine.filter(documented).map((s) => s.assignment!.wageMinor as number));
    const paid = settled(settlements, "COURIER_PAYOUT", (x) => x.partyRef === id);
    lines.push({ courierId: id, name: courierNames[id] ?? "مندوب", deliveredCount: mine.length, undocumentedCount: mine.filter((s) => !documented(s)).length, accruedMinor: acc, paidMinor: paid, balanceMinor: acc - paid });
  }
  lines.sort((a, b) => b.balanceMinor - a.balanceMinor);
  const couriers = {
    accruedMinor: wages, paidMinor: settled(settlements.filter(inSettleMonth), "COURIER_PAYOUT"),
    balanceMinor: sum(lines.map((l) => l.balanceMinor)), lines,
  };
  if (lines.some((l) => l.balanceMinor < 0)) flags.push({ code: "COURIER_OVERPAID", severity: "WARN", message: "مندوب دُفع له أكثر من المستحق الموثَّق؛ راجع التسويات أو سجّل تصحيحاً." });

  return { external: externalOut, local: localOut, cod: codOut, couriers, flags };
}
