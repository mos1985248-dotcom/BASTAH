// components/dashboard/shipping/ShipKpi.tsx — بطاقة مؤشر صغيرة (قراءة فقط).
import type { LucideIcon } from "lucide-react";
import s from "./shipping.module.css";

export default function ShipKpi({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className={s.kpi}>
      <span className={s.kpiIcon}>
        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <p className={s.kpiLabel}>{label}</p>
        <p className={s.kpiValue}>{value}</p>
      </div>
    </div>
  );
}
