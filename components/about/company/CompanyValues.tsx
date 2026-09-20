import { t } from "@/theme";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./CompanyValues.module.css";

const VALUES = [
{
number: "01",
icon: Heart,
title: "نبدأ من الإنسان",
description:
"نضع صاحب المشروع والعميل في قلب التجربة، ونبني خدماتنا حول احتياجاتهم الحقيقية.",
},
{
number: "02",
icon: ShieldCheck,
title: "نبني بثقة",
description:
"نهتم بالوضوح والموثوقية وجودة التجربة في كل خطوة من خطوات استخدام بسطة.",
},
{
number: "03",
icon: Sparkles,
title: "نبسّط التعقيد",
description:
"نحوّل الأدوات الرقمية المعقدة إلى تجربة واضحة وسهلة تساعد المشروع على النمو.",
},
];

export default function CompanyValues() {
return (
<section
style={{
background: t.colors.cream.bg,
padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
direction: "rtl",
}}
>
<div
style={{
width: "100%",
maxWidth: 1180,
margin: "0 auto",
}}
>
<div
style={{
maxWidth: 720,
marginBottom: t.spacing["8"],
}}
>
<p
style={{
margin: `0 0 ${t.spacing["3"]}`,
color: t.colors.gold[600],
fontSize: t.typography.fontSize.sm,
fontWeight: t.typography.fontWeight.bold,
}}
>
قيمنا </p>

```
      <h2
        style={{
          margin: `0 0 ${t.spacing["4"]}`,
          color: t.colors.primary[800],
          fontSize: t.typography.fontSize["3xl"],
          fontWeight: t.typography.fontWeight.bold,
          lineHeight: 1.5,
        }}
      >
        مبادئ بسيطة تقود كل ما نبنيه
      </h2>

      <p
        style={{
          margin: 0,
          color: t.colors.text.body,
          fontSize: t.typography.fontSize.base,
          lineHeight: 2,
        }}
      >
        نريد أن تكون بسطة أكثر من مجرد منصة؛ نريدها تجربة واضحة وموثوقة
        وقريبة من الناس.
      </p>
    </div>

    <div
      className={styles.valuesBox}
      style={{
        background: t.colors.primary[950],
      }}
    >
      <div className={styles.valuesGrid}>
        {VALUES.map(
          ({ number, icon: Icon, title, description }) => (
            <article key={number} className={styles.valueItem}>
              <div className={styles.valueHeader}>
                <span className={styles.valueNumber}>{number}</span>

                <div
                  className={styles.valueIcon}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: t.colors.gold[400],
                  }}
                >
                  <Icon size={21} strokeWidth={1.8} />
                </div>
              </div>

              <div className={styles.valueContent}>
                <h3
                  style={{
                    color: t.colors.text.onDark,
                    fontSize: t.typography.fontSize.xl,
                    fontWeight: t.typography.fontWeight.bold,
                    lineHeight: 1.5,
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    color: t.colors.text.onDarkMuted,
                    fontSize: t.typography.fontSize.base,
                    lineHeight: 2,
                  }}
                >
                  {description}
                </p>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  </div>
</section>
);
}
