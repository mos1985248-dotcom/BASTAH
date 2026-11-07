// components/home/PlanCard.tsx
import { Check, X } from "lucide-react";
import type { PlanConfig } from "@/components/pricing/plan-types";
import { t } from "@/theme";
import { formatPlatformCopy } from "@/lib/brand";
import s from "./plans.module.css";

export default function PlanCard({ plan }: { plan: PlanConfig }) {
  const featured = Boolean(plan.badgeAr);
  const rows = [
    {
      ok: true,
      text: plan.maxProducts === null ? "منتجات غير محدودة" : `${plan.maxProducts} منتج كحد أقصى`,
    },
    {
      ok: plan.hasAIFeatures,
      text: plan.hasAIFeatures ? "مساعد الذكاء الاصطناعي (منيرة)" : "بدون منيرة",
    },
    {
      ok: plan.hasDaftari,
      text: plan.hasDaftari ? "نظام المحاسبة (دفاتري)" : "بدون دفاتري",
    },
  ];

  return (
    <article className={`${s.card} ${featured ? s.featured : ""}`} data-home-reveal>
      {plan.badgeAr && <span className={s.badge}>{formatPlatformCopy(plan.badgeAr)}</span>}

      <h3 className={s.name} style={{ fontFamily: t.typography.fontFamily.display }}>
        {formatPlatformCopy(plan.nameAr)}
      </h3>
      {plan.taglineAr && <p className={s.tagline}>{formatPlatformCopy(plan.taglineAr)}</p>}

      <p className={s.price}>
        {plan.priceMonthly === 0 ? (
          <span className={s.amount}>مجانًا</span>
        ) : (
          <>
            <span className={s.amount}>{plan.priceMonthly}</span>
            <span className={s.unit}>ر.س / شهريًا</span>
          </>
        )}
      </p>

      <ul className={s.rows}>
        {rows.map((r) => (
          <li key={r.text} className={r.ok ? s.row : `${s.row} ${s.off}`}>
            {r.ok ? (
              <Check size={18} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <X size={18} strokeWidth={2} aria-hidden="true" />
            )}
            <span>{r.text}</span>
          </li>
        ))}
      </ul>

      <a href="/pricing" className={s.cta} aria-label={`اختيار باقة ${formatPlatformCopy(plan.nameAr)}`}>
        {featured ? "ابدأ الآن" : "اختيار الباقة"}
      </a>
    </article>
  );
}
