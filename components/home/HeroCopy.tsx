// components/home/HeroCopy.tsx
import { t } from "@/theme";
import s from "./hero.module.css";

export default function HeroCopy({ showStartStore }: { showStartStore: boolean }) {
  return (
    <div className={s.copy}>
      <p className={s.kicker}>من قلب السوق السعودي</p>

      <h1 className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
        ادعم الأسر المنتجة
        <span className={s.titleAccent}>واكتشف منتجات سعودية أصيلة</span>
      </h1>

      <p className={s.lead}>
        سوق يجمع لك منتجات الأسر السعودية المنتجة في مكان واحد، من التمور
        والعطور إلى الأطعمة والهدايا والمنتجات اليدوية.
      </p>

      <div className={s.actions}>
        <a href="/marketplace" className={`${s.cta} ${s.ctaGold}`}>
          تسوّق الآن
        </a>
        <a href="/marketplace" className={`${s.cta} ${s.ctaLight}`}>
          تصفّح المتاجر
        </a>
        {showStartStore && (
          <a href="/register" className={s.textLink}>
            افتح متجرك مجّاناً ←
          </a>
        )}
      </div>

      <p className={s.trust}>منتجات محلية من أسر سعودية منتجة</p>
    </div>
  );
}
