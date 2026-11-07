// components/auth/reset-steps/SetPasswordStep.tsx
import { Lock, Check } from "lucide-react";
import AuthField from "../AuthField";
import AuthButton from "../AuthButton";
import AuthError from "../AuthError";
import PasswordStrengthBar from "../PasswordStrengthBar";
import s from "../auth.module.css";

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
    <div className={`${s.step} ${s.fullStep}`}>
      <div className={s.stepIcon}>
        <Lock size={26} strokeWidth={1.8} />
      </div>

      <h1 className={s.stepTitle}>كلمة مرور جديدة</h1>
      <p className={s.stepText}>أنشئ كلمة مرور قوية وآمنة لحسابك.</p>

      <div className={s.passwordGroup}>
        <AuthField
          label="كلمة المرور الجديدة"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="8 أحرف أو أكثر"
          autoComplete="new-password"
        />
        <PasswordStrengthBar password={password} />
      </div>

      <AuthField
        label="تأكيد كلمة المرور"
        type="password"
        value={confirm}
        onChange={onConfirmChange}
        placeholder="أعد كتابة كلمة المرور"
        autoComplete="new-password"
      />

      <AuthError message={error} />

      <AuthButton
        onClick={onSubmit}
        loading={loading}
        idleLabel={
          <>
            حفظ كلمة المرور الجديدة
            <Check size={15} strokeWidth={2.2} />
          </>
        }
        loadingLabel="جاري المعالجة..."
      />
    </div>
  );
}
