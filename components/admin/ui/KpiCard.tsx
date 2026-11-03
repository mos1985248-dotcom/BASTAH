// components/admin/ui/KpiCard.tsx
// ⚠️ لا يوجد حقل "نسبة التغيّر عن الشهر الماضي" بـ/api/admin/analytics —
// لذا هذا المكوّن لا يعرض أي مؤشر اتجاه مُخترَع. يعرض فقط القيمة الحقيقية
// + وصفاً ثابتاً اختيارياً (مثل "هذا الشهر") بدون أي رقم نسبي غير موجود.
import type { LucideIcon } from "lucide-react";
import s from "../admin-ui.module.css";

const TONE = { default: "", success: s.toneSuccess, warning: s.toneWarning, danger: s.toneDanger } as const;

export default function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tone?: keyof typeof TONE;
}) {
  return (
    <div className={`${s.kpi} ${TONE[tone]}`}>
      <div className={s.kpiHead}>
        <span className={s.kpiIcon}>
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className={s.kpiLabel}>{label}</span>
      </div>
      <span className={s.kpiValue}>{value}</span>
      {sub && <span className={s.kpiSub}>{sub}</span>}
    </div>
  );
}
