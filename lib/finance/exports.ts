// lib/finance/exports.ts — ملفات CSV للمركز المالي (UTF-8 + BOM، حماية الحقن في csv.ts).
import { type Cell, toCsv } from "./csv";
import type { BreakEvenOut } from "./breakeven";
import type { StatementRow } from "./statement";
import type { MonthlySummary } from "./types";
import { monthLabel } from "./riyadh";

const sar = (minor: number | null): Cell => (minor === null ? "غير متاح" : { sar: minor });
const usd = (micro: number | null): Cell => (micro === null ? "غير متاح" : (micro / 1_000_000).toFixed(6));

export function summaryCsv(s: MonthlySummary, be: BreakEvenOut): string {
  const r: Cell[][] = [];
  const add = (section: string, item: string, value: Cell, note = "") => r.push([section, item, value, note]);
  const sub = s.subscriptions;
  add("الاشتراكات", "المحصَّل (شامل الضريبة المسجّلة)", sar(sub.paidGrossMinor), "مؤكَّد: فواتير PAID بتاريخ الدفع");
  add("الاشتراكات", "قبل الضريبة", sar(sub.preVatMinor), sub.preVatMinor === null ? "إعداد الضريبة غير محدد" : "");
  add("الاشتراكات", "الضريبة المسجّلة", sar(sub.vatRecordedMinor));
  add("الاشتراكات", "الاستردادات الموثقة", sar(sub.refundsMinor));
  add("الاشتراكات", "صافي المحصَّل", sar(sub.netCollectedMinor));
  add("الاشتراكات", "تحصيل سنوي في الشهر", sar(sub.yearlyCashMinor), "تدفق نقدي وليس إيراداً شهرياً متكرراً");
  add("الاشتراكات", "المتكرر الشهري (تقدير)", sar(sub.recurringMonthlyEstimateMinor), "تقديري");
  add("الشحن الخارجي", "عمولة بسطة المستحقة", sar(s.external.accruedMinor), `شحنات مؤهلة ${s.external.eligibleCount}، غير موثقة ${s.external.undocumentedCount}`);
  add("الشحن الخارجي", "المحصَّل فعلاً", sar(s.external.receivedMinor));
  add("الشحن الخارجي", "المتبقي (تراكمي)", sar(s.external.outstandingMinor));
  add("بسطة للشحن", "قيمة التوصيل (موثقة)", sar(s.local.deliveryFeeMinor), `غير موثقة ${s.local.undocumentedCount}`);
  add("بسطة للشحن", "أجور المناديب", sar(s.local.courierWagesMinor));
  add("بسطة للشحن", "التكاليف المباشرة", sar(s.local.directCostMinor));
  add("بسطة للشحن", "هامش بسطة", sar(s.local.marginMinor));
  add("COD", "رسوم العميل (إجمالي)", sar(s.cod.customerFeesGrossMinor));
  add("COD", "حصة الناقل", sar(s.cod.carrierSharesMinor));
  add("COD", "صافي حصة بسطة", sar(s.cod.netShareMinor), `طلبات بإعداد تكلفة ناقص ${s.cod.incompleteCount}`);
  add("المصروفات", "التشغيلية (مستحقة)", sar(s.expenses.operatingIncurredMinor));
  add("المصروفات", "التشغيلية (مدفوعة)", sar(s.expenses.operatingPaidMinor));
  add("المصروفات", "التأسيس (مستحقة)", sar(s.expenses.establishmentIncurredMinor));
  add("المناديب", "الأجور المستحقة (الشهر)", sar(s.couriers.accruedMinor));
  add("المناديب", "الدفعات (الشهر)", sar(s.couriers.paidMinor));
  add("المناديب", "الرصيد المتبقي (تراكمي)", sar(s.couriers.balanceMinor));
  add("الذكاء الاصطناعي", `التكلفة (${s.ai.source === "DOCUMENTED" ? "موثَّقة" : s.ai.source === "PROVISIONAL" ? "محسوبة مؤقتاً" : "لا بيانات"}) بالدولار`, usd(s.ai.costUsdMicro));
  add("الذكاء الاصطناعي", "التكلفة بالريال", sar(s.ai.costSarMinor), s.ai.costSarMinor === null ? "بلا سعر صرف موثَّق" : "");
  add("النتيجة", s.result.label, sar(s.result.operatingResultCashMinor));
  add("النتيجة", "صافي التدفق النقدي", sar(s.result.netCashFlowMinor));
  add("النتيجة", "مستحقات غير محصَّلة (تراكمي)", sar(s.result.accruedDuesMinor));
  add("نقطة التعادل", "الحالة", be.status, be.basis === "ACTUAL" ? "فعلي" : "تقديري");
  add("نقطة التعادل", "نسبة التغطية %", be.coveragePct ?? "غير متاح");
  add("نقطة التعادل", "المتبقي للتعادل", sar(be.remainingMinor));
  for (const f of s.flags) add("تنبيهات", f.code, f.count ?? "", f.message);
  return toCsv(["القسم", "البند", "القيمة (ر.س ما لم يُذكر)", "ملاحظة"], r);
}

export function courierStatementCsv(rows: StatementRow[]): string {
  const status = { PAID: "مدفوع", PARTIAL: "جزئي", UNPAID: "غير مدفوع", NA: "—" } as const;
  return toCsv(
    ["رقم الطلب", "تاريخ التسليم", "المدينة", "قيمة التوصيل", "مستحق المندوب", "حالة الاستحقاق", "حالة السداد"],
    rows.map((l) => [l.orderNumber, l.deliveredAt.toISOString().slice(0, 10), l.city, sar(l.deliveryFeeMinor), sar(l.wageMinor), l.dueStatus === "DOCUMENTED" ? "موثق" : "غير موثق", status[l.paymentStatus]]),
  );
}

export const monthFile = (prefix: string, m: { year: number; month: number }) => `${prefix}-${monthLabel(m)}.csv`;
