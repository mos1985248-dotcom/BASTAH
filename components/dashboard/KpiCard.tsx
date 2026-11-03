// components/dashboard/KpiCard.tsx
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./home.module.css";

export default function KpiCard({
  icon: Icon,
  value,
  label,
  changePct,
  highlighted,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  changePct?: number;
  highlighted?: boolean;
}) {
  const positive = (changePct ?? 0) >= 0;
  return (
    <div className={`${s.kpi} ${highlighted ? s.kpiHi : ""}`} style={uiVars}>
      <span className={s.kpiIcon}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
      <div className={s.kpiBody}>
        <span className={s.kpiLabel}>{label}</span>
        <span className={s.kpiValue}>{value}</span>
        {changePct !== undefined && (
          <span className={`${s.chg} ${positive ? s.up : s.down}`} aria-label={`${positive ? "ارتفاع" : "انخفاض"} ${Math.abs(changePct)}٪`}>
            {positive ? <TrendingUp size={12} strokeWidth={2.2} aria-hidden="true" /> : <TrendingDown size={12} strokeWidth={2.2} aria-hidden="true" />}
            {Math.abs(changePct)}٪
          </span>
        )}
      </div>
    </div>
  );
}
