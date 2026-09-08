// components/auth/reset-steps/DoneStep.tsx
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { t } from "@/theme";

export default function DoneStep({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: t.spacing["4"], padding: `${t.spacing["2"]} 0` }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: t.radius.full,
          background: t.colors.semantic.successBg,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
        }}
      >
        <CheckCircle2 size={36} strokeWidth={1.6} color={t.colors.semantic.success} />
      </div>
      <h2 style={{ margin: 0, fontSize: t.typography.fontSize.xl, color: t.colors.primary[800] }}>تم تغيير كلمة المرور!</h2>
      <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>
        يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة
      </p>
      <button
        onClick={onGoToLogin}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "13px",
          background: t.colors.primary[800],
          border: "none",
          borderRadius: t.radius.md,
          fontSize: t.typography.fontSize.base,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.text.onDark,
          cursor: "pointer",
        }}
      >
        تسجيل الدخول
        <ArrowLeft size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
