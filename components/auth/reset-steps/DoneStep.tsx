// components/auth/reset-steps/DoneStep.tsx
import { CheckCircle2, ArrowLeft } from "lucide-react";
import s from "../auth.module.css";

export default function DoneStep({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
    <div className={s.step}>
      <div className={`${s.stepIcon} ${s.stepOk}`}>
        <CheckCircle2 size={34} strokeWidth={1.8} />
      </div>

      <h2 className={s.stepTitle}>تم تغيير كلمة المرور بنجاح</h2>
      <p className={s.stepText}>يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>

      <button type="button" onClick={onGoToLogin} className={s.btn}>
        تسجيل الدخول
        <ArrowLeft size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
