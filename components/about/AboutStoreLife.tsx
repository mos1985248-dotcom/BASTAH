
// components/about/AboutStoreLife.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutStoreLife.module.css";

export default function AboutStoreLife() {
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
              src="/images/story/story-store-life.jpg.jpg"
              alt="صاحب متجر محلي يدير مشروعه ومنتجاته"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div className={styles.content}>
            <p className={styles.eyebrow}>حياة المتجر</p>

            <h2
              style={{
                margin: 0,
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              لكل متجر حكاية
            </h2>

            <div className={styles.text}>
              <p>
                لهذا لا ننظر إلى متاجر بسطة على أنها متشابهة.
              </p>

              <p>
                قد تجد أسرة تصنع الحلويات المنزلية.
              </p>

              <p>
                وأخرى تقدم منتجات يدوية.
              </p>

              <p>
                وأخرى تحافظ على حرفة شعبية.
              </p>

              <p>
                وأخرى تبيع منتجًا بدأ من وصفة عائلية قديمة.
              </p>

              <p className={styles.strong}>
                كل واحدة منها تستحق أن تُروى قصتها بطريقتها.
              </p>

              <p>
                وهنا يأتي دور المحتوى في بسطة.
              </p>

              <p>
                المتجر ليس مجرد واجهة للبيع؛ بل مساحة يمكن أن تعرّف الناس
                بالأسرة ومنتجاتها وتاريخها.
              </p>

              <p className={styles.highlight}>
                نريد أن يكتشف العميل المنتج، ثم يكتشف القصة، ثم يشعر بأنه اشترى
                شيئًا له معنى.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

