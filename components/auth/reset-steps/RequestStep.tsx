// components/auth/reset-steps/RequestStep.tsx
import { KeyRound, ArrowLeft } from "lucide-react";
import { t } from "@/theme";
import AuthField from "../AuthField";
import AuthButton from "../AuthButton";
import AuthError from "../AuthError";

export default function RequestStep({
  email,
  onEmailChange,
  error,
  loading,
  onSubmit,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: t.spacing["4"],
        direction: "rtl",
      }}
    >
      {/* العنوان */}
      <div
        style={{
          textAlign: "center",
          marginBottom: t.spacing["1"],
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: `0 auto ${t.spacing["3"]}`,
            borderRadius: 16,
            background: t.colors.primary[50],
            border: `1px solid ${t.colors.primary[100]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KeyRound
            size={26}
            strokeWidth={1.8}
            color={t.colors.primary[800]}
          />
        </div>

        <h1
          style={{
            fontFamily: t.typography.fontFamily.heading,
            margin: `0 0 ${t.spacing["2"]}`,
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.4,
            color: t.colors.primary[800],
          }}
        >
          استعادة كلمة المرور
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: t.typography.fontSize.sm,
            color: t.colors.text.mid,
            lineHeight: t.typography.lineHeight.relaxed,
          }}
        >
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
        </p>
      </div>

      {/* البريد الإلكتروني */}
      <AuthField
        label="البريد الإلكتروني"
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="example@email.com"
      />

      {/* الخطأ */}
      <AuthError message={error} />

      {/* الإرسال */}
      <AuthButton
        onClick={onSubmit}
        loading={loading}
        idleLabel={
          <>
            إرسال رابط الاستعادة
            <ArrowLeft
              size={15}
              strokeWidth={2}
              style={{ transform: "rotate(180deg)" }}
            />
          </>
        }
        loadingLabel="جاري المعالجة..."
      />

      {/* العودة لتسجيل الدخول */}
      <a
        href="/login"
        className="basita-auth-back-link"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: t.spacing["1"],
          textAlign: "center",
          fontSize: t.typography.fontSize.sm,
          color: t.colors.gold[600],
          fontWeight: t.typography.fontWeight.semibold,
          textDecoration: "none",
        }}
      >
        <ArrowLeft
          size={14}
          strokeWidth={2}
          style={{ transform: "rotate(180deg)" }}
        />
        تذكرت كلمة المرور؟ تسجيل الدخول
      </a>
    </div>
  );
}