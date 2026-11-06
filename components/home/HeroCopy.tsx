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
        <a href="/marketplace" className={`${s.cta} ${s.ctaGold}`}>
          تسوّق الآن
        </a>
        {showStartStore && (
          <a href="/register" className={`${s.cta} ${s.ctaLight}`}>
            افتح بسطتك مجانًا
          </a>
        )}
      </div>

    </div>
  );
}
