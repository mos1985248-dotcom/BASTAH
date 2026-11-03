// components/auth/reset-steps/RequestStep.tsx
import { KeyRound, ArrowLeft } from "lucide-react";
import AuthField from "../AuthField";
import AuthButton from "../AuthButton";
import AuthError from "../AuthError";
import s from "../auth.module.css";

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
    <div className={`${s.step} ${s.fullStep}`}>
      <div className={s.stepIcon}>
        <KeyRound size={26} strokeWidth={1.8} />
      </div>

      <h1 className={s.stepTitle}>استعادة كلمة المرور</h1>
      <p className={s.stepText}>أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.</p>

      <AuthField
        label="البريد الإلكتروني"
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="example@email.com"
        autoComplete="email"
        hint="حسابك بالجوال أو Google؟ لا تحتاج كلمة مرور، ادخل مباشرة من صفحة تسجيل الدخول."
      />

      <AuthError message={error} />

      <AuthButton
        onClick={onSubmit}
        loading={loading}
        idleLabel={
          <>
            إرسال رابط الاستعادة
            <ArrowLeft size={15} strokeWidth={2} />
          </>
        }
        loadingLabel="جاري المعالجة..."
      />

      <a href="/login" className={s.back}>
        تذكرت كلمة المرور؟ تسجيل الدخول
      </a>
    </div>
  );
}
