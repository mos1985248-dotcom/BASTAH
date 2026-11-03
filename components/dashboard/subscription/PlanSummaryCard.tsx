// components/dashboard/subscription/PlanSummaryCard.tsx — عرض فقط
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { fmtDate } from "./invoiceFormat";
import s from "../forms.module.css";

const TONE: Record<string, "ok" | "warn" | "bad" | "off"> = { ACTIVE: "ok", TRIAL: "ok", GRACE_PERIOD: "warn", SUSPENDED: "bad", EXPIRED: "bad", CANCELLED: "off" };

export default function PlanSummaryCard({
  planName, statusKey, statusLabel, needsAttention, cycleLabel, pricePerMonth, startDate, endLabel, endDate, lastInvoiceHref,
}: {
  planName: string; statusKey: string; statusLabel: string; needsAttention: boolean; cycleLabel: string;
  pricePerMonth: number; startDate: string | null; endLabel: string; endDate: string | null; lastInvoiceHref?: string;
}) {
  return (
    <section className={s.panel} style={uiVars} aria-labelledby="plan-title">
      <div className={s.panelHead}>
        <div>
          <p className={s.help} style={{ margin: 0 }}>باقتك الحالية</p>
          <h2 id="plan-title" className={s.panelTitle} style={{ fontSize: 20 }}>{planName}</h2>
        </div>
        <StatusBadge label={statusLabel} tone={TONE[statusKey] ?? "ok"} />
      </div>
      <div className={s.panelBody}>
        {needsAttention && (
          <p className={s.err} role="alert">
            <AlertTriangle size={15} strokeWidth={1.8} aria-hidden="true" />
            {statusKey === "SUSPENDED"
              ? "متجرك معلَّق حالياً — منتجاتك غير ظاهرة للعملاء. جدّد اشتراكك لإعادة التفعيل فوراً."
              : "اشتراكك بحاجة للتجديد لتفادي تعليق متجرك."}
          </p>
        )}
        <div className={s.two}>
          <div><p className={s.help}>دورة الفوترة</p><p className={s.itemName}>{cycleLabel}</p></div>
          <div><p className={s.help}>السعر</p><p className={s.itemName}>{pricePerMonth} ر.س / شهرياً</p></div>
          <div><p className={s.help}>بداية الاشتراك</p><p className={s.itemName}>{fmtDate(startDate)}</p></div>
          <div><p className={s.help}>{endLabel}</p><p className={s.itemName}>{fmtDate(endDate)}</p></div>
        </div>
        <a href="/pricing" className={s.cta}>
          {needsAttention ? "تجديد الاشتراك الآن" : "تغيير الباقة"}
          <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
        </a>
        {lastInvoiceHref && <a href={lastInvoiceHref} className={s.link}>عرض الفواتير ↓</a>}
      </div>
    </section>
  );
}
