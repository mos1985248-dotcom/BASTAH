// components/admin/StatCard.tsx
import { t } from "@/theme";

export default function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "14px 16px", border: `1px solid ${t.colors.cream.border}` }}>
      <p style={{ margin: "0 0 3px", fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{label}</p>
      <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: color ?? t.colors.primary[800] }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 10, color: t.colors.text.light }}>{sub}</p>}
    </div>
  );
}
