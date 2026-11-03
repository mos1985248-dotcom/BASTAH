// components/layout/FooterNewsletter.tsx
"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import s from "./footer.module.css";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) return;

    // ملاحظة:
    // هذا يعرض نجاح الاشتراك فقط حاليًا.
    // ربط الحفظ الفعلي بالـ API يمكن إضافته لاحقًا.
    setSent(true);
  };

  return (
    <section aria-labelledby="newsletter-title">
      <h2 id="newsletter-title" className={s.newsTitle}>انضم إلى نشرتنا البريدية</h2>
      <p className={s.newsText}>عروض جديدة ومنتجات مميزة وأخبار بسطة تصلك أولًا.</p>

      {sent ? (
        <div className={s.sent} role="status">
          <Check size={18} strokeWidth={2.2} aria-hidden="true" />
          <span>تم الاشتراك بنجاح، شكرًا لك!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={s.form}>
          <Mail size={18} strokeWidth={1.8} className={s.mailIcon} aria-hidden="true" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="أدخل بريدك الإلكتروني"
            aria-label="البريد الإلكتروني"
            className={s.input}
            required
          />
          <button type="submit" className={s.submit}>اشترك الآن</button>
        </form>
      )}
    </section>
  );
}
