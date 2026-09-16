// components/auth/reset-steps/SentStep.tsx
import { MailCheck } from "lucide-react";
import { t } from "@/theme";

export default function SentStep({
  email,
  onResend,
}: {
  email: string;
  onResend: () => void;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: t.spacing["3"],
        direction: "rtl",
      }}
    >
      {/* أيقونة البريد */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 17,
          background: t.colors.primary[50],
          border: `1px solid ${t.colors.primary[100]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: t.spacing["1"],
        }}
      >
        <MailCheck
          size={30}
          strokeWidth={1.8}
          color={t.colors.primary[800]}
        />
      </div>

      {/* العنوان */}
      <h2
        style={{
          fontFamily: t.typography.fontFamily.heading,
          margin: 0,
          fontSize: t.typography.fontSize.lg,
          fontWeight: t.typography.fontWeight.bold,
          lineHeight: 1.45,
          color: t.colors.primary[800],
        }}
      >
        تحقق من بريدك الإلكتروني
      </h2>

      {/* البريد */}
      <p
        style={{
          margin: 0,
          fontSize: t.typography.fontSize.sm,
          color: t.colors.text.mid,
          lineHeight: t.typography.lineHeight.relaxed,
        }}
      >
        أرسلنا رابط الاستعادة إلى
        <br />
        <strong
          style={{
            display: "inline-block",
            marginTop: 3,
            color: t.colors.text.dark,
            fontWeight: t.typography.fontWeight.semibold,
            direction: "ltr",
            unicodeBidi: "plaintext",
          }}
        >
          {email}
        </strong>
      </p>

      {/* المساعدة */}
      <p
        style={{
          margin: `${t.spacing["1"]} 0 0`,
          fontSize: t.typography.fontSize.xs,
          color: t.colors.text.mid,
          lineHeight: t.typography.lineHeight.relaxed,
        }}
      >
        لم يصلك البريد؟ تحقّق من مجلد البريد العشوائي، أو أعد الإرسال.
      </p>

      {/* إعادة الإرسال */}
      <button
        type="button"
        onClick={onResend}
        className="basita-btn-interactive"
        style={{
          width: "100%",
          minHeight: 44,
          marginTop: t.spacing["2"],
          padding: "0 16px",
          background: t.colors.cream.card,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: 13,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.semibold,
          color: t.colors.primary[800],
          cursor: "pointer",
        }}
      >
        إعادة إرسال رابط الاستعادة
      </button>
    </div>
  );
}