// components/auth/reset-steps/SetPasswordStep.tsx
import { Lock, Check } from "lucide-react";
import { t } from "@/theme";
import AuthField from "../AuthField";
import AuthButton from "../AuthButton";
import AuthError from "../AuthError";
import PasswordStrengthBar from "../PasswordStrengthBar";

export default function SetPasswordStep({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  error,
  loading,
  onSubmit,
}: {
  password: string;
  confirm: string;
  onPasswordChange: (v: string) => void;
  onConfirmChange: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
      <div style={{ textAlign: "center" }}>
        <Lock size={34} strokeWidth={1.5} color={t.colors.primary[800]} style={{ display: "block", margin: `0 auto ${t.spacing["2"]}` }} />
        <h1 style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          كلمة مرور جديدة
        </h1>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>
          اختاري كلمة مرور قوية لحسابك
        </p>
      </div>

      <AuthField label="كلمة المرور الجديدة" type="password" value={password} onChange={onPasswordChange} placeholder="8 أحرف على الأقل" />
      <PasswordStrengthBar password={password} />
      <AuthField label="تأكيد كلمة المرور" type="password" value={confirm} onChange={onConfirmChange} placeholder="أعيدي كتابة كلمة المرور" />

      <AuthError message={error} />
      <AuthButton
        onClick={onSubmit}
        loading={loading}
        idleLabel={<>حفظ كلمة المرور الجديدة <Check size={15} strokeWidth={2.2} /></>}
        loadingLabel="جاري المعالجة..."
      />
    </div>
  );
}
