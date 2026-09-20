
// components/about/AboutGlobalReach.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutGlobalReach.module.css";

export default function AboutGlobalReach() {
  return (
    <section
      style={{
        background: t.colors.cream.bg,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.image}>
            <Image
              src="/images/story/story-global-reach.jpg.jpg"
              alt="منتجات محلية تحمل الهوية السعودية ويمكن أن تصل إلى عملاء من أماكن مختلفة"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div className={styles.content}>
            <p className={styles.eyebrow}>الوصول</p>

            <h2
              style={{
                margin: 0,
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              من السوق المحلي إلى العالم
            </h2>

            <div className={styles.text}>
              <p>
                بدأت الفكرة من الأسرة والمنتج الشعبي، لكننا نرى أن هذه
                المنتجات قادرة على الوصول إلى جمهور أكبر.
              </p>

              <p>
                السائح الذي يزور المملكة قد يبحث عن قطعة صغيرة تحمل معه ذكرى
                من المكان.
              </p>

              <p>
                والشخص الذي يعيش بعيدًا عن وطنه قد يجد في منتج شعبي شيئًا يعيده
                إلى ذاكرة البيت.
              </p>

              <p>
                والعميل خارج المنطقة قد يهتم بمنتج مصنوع يدويًا ويحمل هوية
                وثقافة مختلفة.
              </p>

              <p className={styles.highlight}>
                لهذا صُممت بسطة لتكون قابلة للوصول إلى جمهور متعدد اللغات،
                دون أن تفقد المنتجات هويتها الأصلية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}