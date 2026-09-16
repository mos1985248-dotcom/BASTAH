// components/auth/EmailConfirmNotice.tsx
import Image from "next/image";
import { MailCheck, ArrowLeft } from "lucide-react";
import { t } from "@/theme";

export default function EmailConfirmNotice({
  email,
}: {
  email: string;
}) {
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
          width: "100%",
          maxWidth: 430,
          background: t.colors.cream.card,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: 22,
          padding: `${t.spacing["8"]} ${t.spacing["6"]}`,
          textAlign: "center",
          boxShadow: "0 12px 34px rgba(67,48,29,0.065)",
        }}
      >
        {/* الشعار */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: t.spacing["5"],
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              background: "#FFFFFF",
              border: `1px solid ${t.colors.cream.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 6px 18px rgba(67,48,29,0.07)",
            }}
          >
            <Image
              src="/images/logo-icon.png"
              alt="بسطة"
              width={44}
              height={44}
              style={{
                width: 44,
                height: 44,
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* أيقونة التأكيد */}
        <div
          style={{
            width: 54,
            height: 54,
            margin: "0 auto",
            borderRadius: 16,
            background: t.colors.primary[50],
            border: `1px solid ${t.colors.primary[100]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MailCheck
            size={28}
            strokeWidth={1.8}
            color={t.colors.primary[800]}
          />
        </div>

        {/* العنوان */}
        <h1
          style={{
            fontFamily: t.typography.fontFamily.heading,
            color: t.colors.primary[800],
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.45,
            margin: `${t.spacing["4"]} 0 ${t.spacing["2"]}`,
          }}
        >
          تحقق من بريدك الإلكتروني
        </h1>

        {/* النص */}
        <p
          style={{
            margin: 0,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.base,
            lineHeight: t.typography.lineHeight.relaxed,
          }}
        >
          أرسلنا رابط تأكيد إلى
          <br />
          <strong
            style={{
              color: t.colors.text.dark,
              fontWeight: t.typography.fontWeight.semibold,
              direction: "ltr",
              unicodeBidi: "plaintext",
            }}
          >
            {email}
          </strong>
        </p>

        <p
          style={{
            margin: `${t.spacing["2"]} 0 0`,
            color: t.colors.text.light,
            fontSize: t.typography.fontSize.sm,
            lineHeight: t.typography.lineHeight.relaxed,
          }}
        >
          افتح الرابط في البريد الإلكتروني ثم عد إلى بسطة لتسجيل الدخول.
        </p>

        {/* العودة لتسجيل الدخول */}
        <a
          href="/login"
          className="basita-btn-interactive"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 46,
            marginTop: t.spacing["6"],
            padding: `0 ${t.spacing["6"]}`,
            borderRadius: 13,
            background: t.colors.primary[800],
            color: t.colors.text.onDark,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
            boxShadow: "0 6px 14px rgba(18,63,50,0.14)",
          }}
        >
          الذهاب إلى تسجيل الدخول
          <ArrowLeft
            size={16}
            strokeWidth={2}
            style={{ transform: "rotate(180deg)" }}
          />
        </a>
      </div>
    </div>
  );
}