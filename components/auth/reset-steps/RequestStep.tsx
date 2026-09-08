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
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
      <div style={{ textAlign: "center" }}>
        <KeyRound size={34} strokeWidth={1.5} color={t.colors.primary[800]} style={{ display: "block", margin: `0 auto ${t.spacing["2"]}` }} />
        <h1 style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          نسيتِ كلمة المرور؟
        </h1>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>
          أدخلي بريدك وسنرسل لك رابط الاستعادة
        </p>
      </div>

      <AuthField label="البريد الإلكتروني" type="email" value={email} onChange={onEmailChange} placeholder="example@email.com" />
      <AuthError message={error} />
      <AuthButton
        onClick={onSubmit}
        loading={loading}
        idleLabel={<>إرسال رابط الاستعادة <ArrowLeft size={15} strokeWidth={2} /></>}
        loadingLabel="جاري المعالجة..."
      />

      <a
        href="/login"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", fontSize: t.typography.fontSize.sm, color: t.colors.gold[600], textDecoration: "none" }}
      >
        <ArrowLeft size={13} strokeWidth={2} />
        تذكّرتِ كلمة المرور؟ سجّلي الدخول
      </a>
    </div>
  );
}
