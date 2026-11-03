// components/daftari/MonthSummaryCard.tsx
import { ArrowDownLeft, ArrowUpLeft, RotateCcw, WalletCards, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./daftari.module.css";

export interface MonthSummary {
  income: number;
  expenses: number;
  refunds: number;
  netProfit: number;
}

export default function MonthSummaryCard({ summary }: { summary: MonthSummary }) {
  const items: { label: string; value: number; color: string; Icon: LucideIcon }[] = [
    { label: "الدخل", value: summary.income, color: "var(--ui-green)", Icon: ArrowDownLeft },
    { label: "المصروفات", value: summary.expenses, color: "var(--ui-danger)", Icon: ArrowUpLeft },
    { label: "الاسترجاعات", value: summary.refunds, color: "var(--ui-kicker)", Icon: RotateCcw },
  ];

  return (
    <section className={s.sum} style={uiVars} dir="rtl" aria-label="ملخص الشهر المالي">
      <div className={s.main}>
        <span className={s.mainIcon}><WalletCards size={24} strokeWidth={1.7} aria-hidden="true" /></span>
        <div>
          <span className={s.mainLabel}>صافي الربح هذا الشهر</span>
          <span className={s.mainValue}>{summary.netProfit.toFixed(0)} ر.س</span>
        </div>
      </div>
      {items.map(({ label, value, color, Icon }) => (
        <div key={label} className={s.mini}>
          <span className={s.miniIcon} style={{ color }}><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <div>
            <span className={s.miniLabel}>{label}</span>
            <span className={s.miniValue} style={{ color }}>{value.toFixed(0)} ر.س</span>
          </div>
        </div>
      ))}
    </section>
  );
}
