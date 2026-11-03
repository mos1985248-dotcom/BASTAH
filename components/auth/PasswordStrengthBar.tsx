// components/auth/PasswordStrengthBar.tsx
import s from "./auth.module.css";

export default function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;

  const weak = password.length < 8;
  const medium = password.length >= 8 && password.length < 12;
  const tone = weak ? s.weak : medium ? s.mid : s.strong;
  const label = weak ? "ضعيفة" : medium ? "متوسطة" : "قوية";

  return (
    <div className={s.strength}>
      <div className={s.bar}>
        <div className={`${s.barFill} ${tone}`} />
      </div>

      <div className={s.strengthRow}>
        <span>قوة كلمة المرور: {label}</span>
        {weak && <span>استخدم 8 أحرف أو أكثر</span>}
      </div>
    </div>
  );
}
