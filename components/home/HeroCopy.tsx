// components/home/HeroCopy.tsx
import { t } from "@/theme";
import s from "./hero.module.css";

export default function HeroCopy({ showStartStore }: { showStartStore: boolean }) {
  return (
    <div className={s.copy}>
      <h1 id="home-hero-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
        بسطة مارت..{" "}
        <span className={s.titleAccent}>سوقنا يجمعنا</span>
      </h1>

      <p className={s.lead}>
        اكتشف منتجات الأسر المنتجة والحرفيين، وتسوق أصالة الصنعة السعودية من بسطات أصحابها.
      </p>

      <div className={s.actions}>
        {showStartStore && (
          <a href="/register" className={`${s.cta} ${s.ctaGold}`}>
            افتح بسطتك مجانًا
          </a>
        )}
        <a href="/marketplace" className={`${s.cta} ${s.ctaLight}`}>
          تصفّح البسطات
        </a>
      </div>

      {showStartStore && (
        <p className={s.founderNote}>
          كن من التجّار المؤسسين الأوائل. <strong>ابدأ مجانًا وبدون عمولة على مبيعاتك.</strong>
        </p>
      )}
    </div>
  );
}
