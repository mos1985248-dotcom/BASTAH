import { ArrowLeft, Calculator, PackagePlus } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import frame from "./munira.module.css";
import MerchantToolCopy from "./MerchantToolCopy";
import tools from "./merchant-tools.module.css";
import s from "./product-tools.module.css";
import daftari from "./daftari.module.css";

export default function ProductToolsShowcase() {
  return (
    <section
      className={`${frame.section} ${tools.section}`}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
      aria-labelledby="product-tools-heading"
    >
      <div className={`${frame.card} ${s.card}`}>
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
              <h3><MerchantToolCopy desktop="محرك التسعير" mobile="سعّر على بيّنة" /></h3>
              <p><MerchantToolCopy desktop="أدخل تكلفة المنتج، وقارن بين ثلاثة أسعار مقترحة حسب هامش الربح." mobile="لا تسعّر بالتخمين. احسب الخامات والتغليف ووقت شغلك، وقارن بين ثلاثة أسعار عشان تعرف وش يبقى لك." /></p>
              <ul className={s.tiers} aria-label="خيارات التسعير">
                <li><MerchantToolCopy desktop="اقتصادي" mobile="سعر خفيف" /></li>
                <li><MerchantToolCopy desktop="متوازن" mobile="سعر وسط" /></li>
                <li><MerchantToolCopy desktop="مميز" mobile="سعر أعلى" /></li>
              </ul>
            </div>
          </li>
          <li className={s.feature}>
            <PackagePlus className={s.icon} size={22} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <h3><MerchantToolCopy desktop="تسجيل المخزون" mobile="جهّز كميّتك بدري" /></h3>
              <p><MerchantToolCopy desktop="عند وصول بضاعة، سجّل الكمية وسعر الشراء من صفحة المنتج. يُسجَّل التاريخ تلقائيًا." mobile="سجّل الكمية وتكلفتها أول ما تجهز، عشان تعرف وش عندك قبل ما تزيد الطلبات أو يجي الموسم." /></p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
