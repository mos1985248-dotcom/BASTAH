
// components/about/AboutTech.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutTech.module.css";

export default function AboutTech() {
  return (
    <section
      style={{
        background: t.colors.white,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>التقنية</p>

            <h2
              style={{
                margin: 0,
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              التقنية في خدمة الحكاية
            </h2>

            <div className={styles.text}>
              <p>
                نحن نستخدم التقنية، والذكاء الاصطناعي، والمحتوى الرقمي، ليس
                لمجرد أن نقول إن بسطة منصة تقنية.
              </p>

              <p className={styles.highlight}>
                التقنية عندنا وسيلة.
              </p>

              <p>
                وسيلة تساعد الأسرة على عرض منتجاتها.
              </p>

              <p>
                وسيلة تساعد العميل على اكتشاف ما يبحث عنه.
              </p>

              <p>
                وسيلة تجعل المتجر أكثر حيوية من مجرد صور وأسعار.
              </p>

              <p>
                ووسيلة تجعل الوصول إلى المنتجات الشعبية أسهل، حتى عندما تكون
                الأسرة التي تصنعها بعيدة عن الأسواق الكبيرة.
              </p>

              <p className={styles.finalStatement}>
                ولهذا نطوّر أدوات مثل منيرة لمساعدة المستخدمين على اكتشاف
                المنتجات والتفاعل معها بلغات مختلفة، مع بقاء المنتج والأسرة
                وقصتهما في قلب التجربة.
              </p>
            </div>
          </div>

          <div className={styles.image}>
            <Image
              src="/images/story/story-tech.jpg.jpg"
              alt="التقنية الرقمية في خدمة المنتجات والمتاجر المحلية"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
