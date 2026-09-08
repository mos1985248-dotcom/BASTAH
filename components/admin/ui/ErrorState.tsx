// components/admin/ui/ErrorState.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

export default function ErrorState({ message = "تعذّر تحميل البيانات", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: t.spacing["6"] }}>
      <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.sm, margin: `0 0 ${onRetry ? t.spacing["2"] : "0"}` }}>
        <AlertTriangle size={15} strokeWidth={1.8} />
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ padding: "6px 16px", background: t.colors.white, border: `1px solid ${t.colors.semantic.danger}`, color: t.colors.semantic.danger, borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, cursor: "pointer" }}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
