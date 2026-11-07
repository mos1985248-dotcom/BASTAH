// components/pricing/ComparisonTable.tsx
// مقارنة تفصيلية بين الباقات. كل صف من حقل فعلي في SubscriptionPlanConfig (عبر GET /api/subscription/plans)،
// فلا يظهر ما لا تنفّذه الباقة. الحقل الغائب يظهر «غير متوفر» لا قيمة مختلقة.
import { formatPlatformCopy } from "@/lib/brand";
import { Check, Minus } from "lucide-react";
import type { CSSProperties } from "react";
import type { PlanConfig } from "./plan-types";
import p from "./pricing.module.css";

type Row =
  | { kind: "group"; label: string }
  | { kind: "value"; label: string; get: (pl: PlanConfig) => string }
  | { kind: "flag"; label: string; get: (pl: PlanConfig) => boolean | undefined };

const limit = (n: number | null | undefined, unit: string) =>
  n === undefined ? "—" : n === null ? "غير محدود" : `${n} ${unit}`;

const REPORTS: Record<string, string> = {
  NONE: "غير متوفرة",
  BASIC: "إجمالي المبيعات والأرباح",
  MONTHLY: "شهرية وتفاصيل المنتجات",
  ADVANCED: "تتضمن المصروفات والمقارنة",
  FULL: "كاملة مع تصدير Excel وتحليل ذكي",
};

const ROWS: Row[] = [
  { kind: "group", label: "الحدود" },
  { kind: "value", label: "عدد المنتجات", get: (pl) => limit(pl.maxProducts, "منتج") },
  { kind: "value", label: "عدد الطلبات", get: (pl) => limit(pl.maxOrders, "طلب") },
  { kind: "value", label: "مساحة التخزين", get: (pl) => (pl.storageGB === undefined ? "—" : `${pl.storageGB} جيجابايت`) },
  { kind: "group", label: "أدوات المتجر" },
  { kind: "flag", label: "دفاتري", get: (pl) => pl.hasDaftari },
  { kind: "flag", label: "منيرة (الذكاء الاصطناعي)", get: (pl) => pl.hasAIFeatures },
  { kind: "flag", label: "دومين مخصص", get: (pl) => pl.hasCustomDomain },
  { kind: "flag", label: "بوابة دفع إلكتروني", get: (pl) => pl.hasPaymentGateway },
  { kind: "flag", label: "أكواد خصم مخصصة", get: (pl) => pl.hasDiscountCodes },
  { kind: "flag", label: "إزالة شعار «مدعوم من بسطة مارت»", get: (pl) => pl.hasRemoveBranding },
  { kind: "value", label: "التقارير", get: (pl) => (pl.reportsLevel ? REPORTS[pl.reportsLevel] ?? "—" : "—") },
  { kind: "group", label: "الظهور والثقة" },
  { kind: "flag", label: "ظهور مميّز في بسطة مارت", get: (pl) => pl.hasFeaturedListing },
  { kind: "flag", label: "أولوية في نتائج البحث", get: (pl) => pl.hasPrioritySearch },
  { kind: "flag", label: "توثيق المتجر", get: (pl) => pl.hasVerifiedBadge },
  { kind: "group", label: "الدعم" },
  { kind: "flag", label: "دعم عبر الدردشة", get: (pl) => pl.hasChatSupport },
  { kind: "flag", label: "أولوية الدعم", get: (pl) => pl.hasPrioritySupport },
];

export default function ComparisonTable({ plans, billing }: { plans: PlanConfig[]; billing: "monthly" | "yearly" }) {
  const price = (pl: PlanConfig) =>
    pl.priceMonthly === 0 ? "مجانًا" : `${billing === "yearly" ? Math.round(pl.priceYearly / 12) : pl.priceMonthly} ريال / شهريًا`;

  return (
    <section id="compare" className={`${p.section} ${p.compare}`} aria-labelledby="compare-title">
      <h2 id="compare-title" className={p.h2}>قارن الباقات بالتفصيل</h2>
      <p className={p.lead}>كل ما تشمله كل باقة في مكان واحد، لتختار ما يناسب متجرك.</p>

      <p id="compare-scroll-hint" className={p.scrollHint}>اسحب الجدول أفقيًا لرؤية بقية الباقات</p>
      <div className={p.tableBox} tabIndex={0} role="region" aria-label="جدول مقارنة الباقات" aria-describedby="compare-scroll-hint">
        <table className={p.table} style={{ "--plan-count": plans.length } as CSSProperties}>
          <colgroup>
            <col className={p.featureCol} />
            {plans.map((pl) => <col key={pl.plan} />)}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={p.corner}>الميزة</th>
              {plans.map((pl) => (
                <th key={pl.plan} scope="col" className={`${p.colHead} ${pl.badgeAr ? p.hotCol : ""}`}>
                  <span className={p.colName}>{formatPlatformCopy(pl.nameAr)}</span>
                  <span className={p.colPrice}>{price(pl)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) =>
              row.kind === "group" ? (
                <tr key={row.label} className={p.groupRow}>
                  <th scope="colgroup" colSpan={plans.length + 1}>{row.label}</th>
                </tr>
              ) : (
                <tr key={row.label}>
                  <th scope="row" className={p.rowLabel}>{row.label}</th>
                  {plans.map((pl) => (
                    <td key={pl.plan} className={pl.badgeAr ? p.hotCol : undefined}>
                      {row.kind === "value" ? (
                        <span className={p.val}>{row.get(pl)}</span>
                      ) : row.get(pl) ? (
                        <span className={p.yes}>
                          <Check size={18} strokeWidth={2.4} aria-label="متوفر" />
                        </span>
                      ) : (
                        <span className={p.no}>
                          <Minus size={18} strokeWidth={2} aria-label="غير متوفر" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
