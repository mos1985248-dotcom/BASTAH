// components/auth/EmailConfirmNotice.tsx
import { MailCheck, ArrowLeft } from "lucide-react";
import AuthShell from "./AuthShell";
import s from "./auth.module.css";

export default function EmailConfirmNotice({ email }: { email: string }) {
  return (
    <AuthShell scene="home">
      <div className={s.step}>
        <div className={s.stepIcon}>
          <MailCheck size={28} strokeWidth={1.8} />
        </div>

        <h1 className={s.stepTitle}>تحقق من بريدك الإلكتروني</h1>

        <p className={s.stepText}>
          أرسلنا رابط تأكيد إلى
          <br />
          <strong>{email}</strong>
        </p>

        <p className={s.stepText}>افتح الرابط في البريد الإلكتروني ثم عد إلى بسطة مارت لتسجيل الدخول.</p>

        <a href="/login" className={s.btn}>
          الذهاب إلى تسجيل الدخول
          <ArrowLeft size={16} strokeWidth={2} />
        </a>
      </div>
    </AuthShell>
  );
}
