// components/home/StoreCardSkeleton.tsx
import { t } from "@/theme";
import Skeleton from "@/components/ui/Skeleton";

export default function StoreCardSkeleton() {
  return (
    <div 
      style={{ 
        background: t.colors.white, 
        borderRadius: t.radius.lg, 
        overflow: "hidden", 
        border: `1px solid ${t.colors.cream.border}`,
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Skeleton height={110} radius="0" />
      <div style={{ padding: t.spacing["4"], display: "flex", alignItems: "flex-start", gap: t.spacing["3"], flex: 1, position: "relative" }}>
        <Skeleton width={44} height={44} radius={t.radius.full} style={{ marginTop: -32, border: `2px solid ${t.colors.white}`, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="75%" height={16} />
          <Skeleton width="45%" height={12} />
        </div>
      </div>
    </div>
  );
}