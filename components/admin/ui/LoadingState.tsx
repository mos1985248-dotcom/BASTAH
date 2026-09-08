// components/admin/ui/LoadingState.tsx
import { t } from "@/theme";

export default function LoadingState({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: t.spacing["8"], color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>
      <span
        style={{
          width: 16,
          height: 16,
          border: `2.5px solid ${t.colors.cream.border}`,
          borderTopColor: t.colors.primary[800],
          borderRadius: "50%",
          display: "inline-block",
          animation: "basita-spin 0.7s linear infinite",
        }}
      />
      {label}
      <style>{`@keyframes basita-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
