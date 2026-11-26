import { ArrowLeft, Calculator, PackagePlus } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import frame from "./munira.module.css";
import s from "./product-tools.module.css";
import daftari from "./daftari.module.css";

export default function ProductToolsShowcase() {
  return (
    <section
      className={frame.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
      aria-labelledby="product-tools-heading"
    >
      <div className={frame.card}>
        <header className={s.header}>
          <h2 id="product-tools-heading" className={daftari.title} style={{ fontFamily: t.typography.fontFamily.display }}>
            التسعير والمخزون
          </h2>
          <a href="/dashboard/products" className={`${frame.cta} ${s.cta}`}>
            اذهب إلى منتجاتك
            <ArrowLeft size={17} aria-hidden="true" />
          </a>
        </header>

        <ul className={s.features}>
          <li className={s.feature}>
            <Calculator className={s.icon} size={22} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <h3>محرك التسعير</h3>
              <p>أدخل تكلفة المنتج، وقارن بين ثلاثة أسعار مقترحة حسب هامش الربح.</p>
              <ul className={s.tiers} aria-label="خيارات التسعير">
                <li>اقتصادي</li>
                <li>متوازن</li>
                <li>مميز</li>
              </ul>
            </div>
          </li>
          <li className={s.feature}>
            <PackagePlus className={s.icon} size={22} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <h3>تسجيل المخزون</h3>
              <p>عند وصول بضاعة، سجّل الكمية وسعر الشراء من صفحة المنتج. يُسجَّل التاريخ تلقائيًا.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
