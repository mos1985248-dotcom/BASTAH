// components/dashboard/KpiGridSkeleton.tsx
import { t } from "@/theme";
import Skeleton from "@/components/ui/Skeleton";

export default function KpiGridSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: t.spacing["4"], direction: "rtl" }}>
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          style={{
            background: t.colors.white,
            borderRadius: t.radius.lg,
            border: `1px solid ${t.colors.cream.border}`,
            padding: t.spacing["5"],
            boxShadow: t.shadows.sm,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: t.spacing["3"] }}>
            <Skeleton width={38} height={38} style={{ borderRadius: t.radius.md }} />
            <Skeleton width={50} height={20} style={{ borderRadius: t.radius.full }} />
          </div>
          <Skeleton width="55%" height={32} style={{ marginBottom: 6, borderRadius: t.radius.sm }} />
          <Skeleton width="80%" height={14} style={{ borderRadius: t.radius.sm }} />
        </div>
      ))}
    </div>
  );
}