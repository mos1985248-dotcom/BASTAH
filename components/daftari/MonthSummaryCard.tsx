// components/daftari/MonthSummaryCard.tsx
import { t } from "@/theme";

export interface MonthSummary { income: number; expenses: number; refunds: number; netProfit: number }

export default function MonthSummaryCard({ summary }: { summary: MonthSummary }) {
  const items = [
    { label: "الدخل", value: summary.income, color: t.colors.semantic.success },
    { label: "المصروفات", value: summary.expenses, color: t.colors.semantic.danger },
    { label: "الاسترجاعات", value: summary.refunds, color: t.colors.semantic.warning },
  ];

  return (
    <div style={{ background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`, borderRadius: t.radius.xl, padding: t.spacing["5"] }}>
      <p style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.onDarkMuted }}>صافي الربح هذا الشهر</p>
      <p style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[400] }}>
        {summary.netProfit.toFixed(0)} ر.س
      </p>
      <div style={{ display: "flex", gap: t.spacing["6"], flexWrap: "wrap" }}>
        {items.map((it) => (
          <div key={it.label}>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.white }}>{it.value.toFixed(0)} ر.س</p>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.onDarkMuted }}>{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
