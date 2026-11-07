// components/home/WhyBasita.tsx
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import WhyVisual from "./WhyVisual";
import s from "./why.module.css";

const FEATURES = [
  { n: "٠١", title: "تسويق ودعم", desc: "لمتجرك ومنتجاتك" },
  { n: "٠٢", title: "بدون عمولات", desc: "على جميع الباقات" },
  { n: "٠٣", title: "أدوات متكاملة", desc: "لإدارة متجرك بسهولة" },
  { n: "٠٤", title: "منتجات أصلية", desc: "من مصادر موثوقة" },
  { n: "٠٥", title: "دعم فني سريع", desc: "فريق يرافقك خطوة بخطوة" },
];

export default function WhyBasita() {
  return (
    <section
      aria-labelledby="why-heading"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.grid}>
        <div className={s.copy}>
          <p className={s.kicker}>بسطة مارت للأسر المنتجة</p>
          <h2 id="why-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
            لماذا بسطة مارت؟
          </h2>
          <p className={s.lead}>
            كل ما تحتاجه الأسرة المنتجة لتبيع، تنمو، وتوصل منتجاتها لعملاء أكثر.
          </p>

          <ol className={s.list}>
            {FEATURES.map((f) => (
              <li key={f.n} className={s.row}>
                <span className={s.num} style={{ fontFamily: t.typography.fontFamily.display }} aria-hidden="true">
                  {f.n}
                </span>
                <div>
                  <h3 className={s.rowTitle}>{f.title}</h3>
                  <p className={s.rowDesc}>{f.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <WhyVisual />
      </div>
    </section>
  );
}
