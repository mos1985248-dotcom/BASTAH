// components/auth/reset-steps/SentStep.tsx
import { MailCheck } from "lucide-react";
import s from "../auth.module.css";

export default function SentStep({ email, onResend }: { email: string; onResend: () => void }) {
  return (
    <div className={s.step}>
      <div className={s.stepIcon}>
        <MailCheck size={30} strokeWidth={1.8} />
      </div>

      <h2 className={s.stepTitle}>تحقق من بريدك الإلكتروني</h2>

      <p className={s.stepText}>
        أرسلنا رابط الاستعادة إلى
        <br />
        <strong>{email}</strong>
      </p>

      <p className={s.stepText}>لم يصلك البريد؟ تحقّق من مجلد البريد العشوائي، أو أعد الإرسال.</p>

      <button type="button" onClick={onResend} className={s.btn}>
        إعادة إرسال رابط الاستعادة
      </button>

      <a href="/login" className={s.back}>العودة لتسجيل الدخول</a>
    </div>
  );
}
