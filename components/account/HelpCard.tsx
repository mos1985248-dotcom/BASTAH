// components/account/HelpCard.tsx
import s from "./account.module.css";

export default function HelpCard() {
  return (
    <div className={s.help}>
      <p className={s.helpTitle}>تحتاج مساعدة؟</p>
      <p className={s.helpText}>نحن هنا لخدمتك</p>
      <a href="/dashboard/support" className={s.helpLink}>
        تواصل مع الدعم
      </a>
    </div>
  );
}
