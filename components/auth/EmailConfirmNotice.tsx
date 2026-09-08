// components/auth/EmailConfirmNotice.tsx
import { MailCheck, ArrowLeft } from "lucide-react";
import { t } from "@/theme";

export default function EmailConfirmNotice({ email }: { email: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.colors.cream.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: t.spacing["5"],
        direction: "rtl",
      }}
    >
      <div
        style={{
          background: t.colors.white,
          borderRadius: t.radius.xl,
          padding: `${t.spacing["8"]} ${t.spacing["6"]}`,
          textAlign: "center",
          maxWidth: 400,
          boxShadow: t.shadows.md,
        }}
      >
        <MailCheck size={38} strokeWidth={1.5} color={t.colors.primary[800]} style={{ margin: "0 auto" }} />
        <h2
          style={{
            color: t.colors.primary[800],
            fontSize: t.typography.fontSize.xl,
            margin: `${t.spacing["3"]} 0`,
          }}
        >
          تحققي من بريدك الإلكتروني
        </h2>
        <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.base, lineHeight: t.typography.lineHeight.relaxed }}>
          أرسلنا رابط تأكيد إلى {email}. افتحيه ثم سجّلي دخولك.
        </p>
        <a
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: t.spacing["3"],
            color: t.colors.gold[600],
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
          }}
        >
          الذهاب لتسجيل الدخول
          <ArrowLeft size={14} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
