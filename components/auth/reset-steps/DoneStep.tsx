// components/auth/reset-steps/DoneStep.tsx
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { t } from "@/theme";

export default function DoneStep({
  onGoToLogin,
}: {
  onGoToLogin: () => void;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: t.spacing["4"],
        padding: `${t.spacing["2"]} 0`,
        direction: "rtl",
      }}
    >
      {/* أيقونة النجاح */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: t.radius.full,
          background: t.colors.semantic.successBg,
          border: `1px solid rgba(22, 163, 74, 0.12)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckCircle2
          size={34}
          strokeWidth={1.8}
          color={t.colors.semantic.success}
        />
      </div>

      {/* العنوان */}
      <h2
        style={{
          fontFamily: t.typography.fontFamily.heading,
          margin: 0,
          fontSize: t.typography.fontSize.xl,
          fontWeight: t.typography.fontWeight.bold,
          lineHeight: 1.45,
          color: t.colors.primary[800],
        }}
      >
        تم تغيير كلمة المرور بنجاح
      </h2>

      {/* الوصف */}
      <p
        style={{
          margin: 0,
          maxWidth: 320,
          fontSize: t.typography.fontSize.sm,
          lineHeight: t.typography.lineHeight.relaxed,
          color: t.colors.text.mid,
        }}
      >
        يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
      </p>

      {/* العودة لتسجيل الدخول */}
      <button
        type="button"
        onClick={onGoToLogin}
        className="basita-btn-interactive"
        style={{
          width: "100%",
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: t.spacing["2"],
          padding: "0 18px",
          background: t.colors.primary[800],
          border: "none",
          borderRadius: 14,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.base,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.text.onDark,
          cursor: "pointer",
          boxShadow: "0 6px 14px rgba(18,63,50,0.14)",
        }}
      >
        تسجيل الدخول

        <ArrowLeft
          size={16}
          strokeWidth={2}
          style={{
            transform: "rotate(180deg)",
          }}
        />
      </button>
    </div>
  );
}