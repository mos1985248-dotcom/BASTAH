// components/auth/reset-steps/SentStep.tsx
import { MailCheck } from "lucide-react";
import { t } from "@/theme";

export default function SentStep({ email, onResend }: { email: string; onResend: () => void }) {
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
      <MailCheck size={46} strokeWidth={1.5} color={t.colors.primary[800]} style={{ margin: "0 auto" }} />
      <h2 style={{ margin: 0, fontSize: t.typography.fontSize.lg, color: t.colors.primary[800] }}>تحققي من بريدك</h2>
      <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>
        أرسلنا رابط الاستعادة إلى
        <br />
        <strong style={{ color: t.colors.text.dark }}>{email}</strong>
      </p>
      <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
        لم يصلك؟ تحققي من البريد العشوائي أو
      </p>
      <button
        onClick={onResend}
        style={{
          background: "none",
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
          padding: t.spacing["3"],
          fontSize: t.typography.fontSize.sm,
          cursor: "pointer",
          color: t.colors.text.mid,
        }}
      >
        إعادة الإرسال
      </button>
    </div>
  );
}
