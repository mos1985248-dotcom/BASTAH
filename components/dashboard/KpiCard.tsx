// components/dashboard/KpiCard.tsx
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

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
    <div
      className="basita-card-interactive"
      style={{
        background: highlighted ? `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})` : t.colors.white,
        border: highlighted ? "none" : `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        padding: t.spacing["5"],
        direction: "rtl",
        boxShadow: highlighted ? t.shadows.md : t.shadows.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: t.spacing["3"] }}>
        <div style={{ width: 38, height: 38, borderRadius: t.radius.md, background: highlighted ? "rgba(255,255,255,0.1)" : t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} strokeWidth={1.8} color={highlighted ? t.colors.gold[400] : t.colors.primary[800]} />
        </div>
        {changePct !== undefined && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: t.typography.fontWeight.bold,
              color: positive ? t.colors.semantic.success : t.colors.semantic.danger,
              background: positive ? t.colors.semantic.successBg : t.colors.semantic.dangerBg,
              padding: "3px 9px",
              borderRadius: t.radius.full,
              direction: "ltr",
            }}
          >
            {positive ? <TrendingUp size={12} strokeWidth={2.2} /> : <TrendingDown size={12} strokeWidth={2.2} />}
            {Math.abs(changePct)}%
          </span>
        )}
      </div>
      <p style={{ margin: "0 0 4px", fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: highlighted ? t.colors.white : t.colors.primary[800], letterSpacing: "-0.01em" }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: highlighted ? t.colors.text.onDarkMuted : t.colors.text.mid }}>
        {label}
      </p>
    </div>
  );
}