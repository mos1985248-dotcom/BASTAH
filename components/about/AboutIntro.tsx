
// components/about/AboutIntro.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutIntro.module.css";

export default function AboutIntro() {
  return (
    <section
      id="story"
      style={{
        width: "100%",
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        boxSizing: "border-box",
        direction: "rtl",
        background: t.colors.white,
      }}
    >
      <div className={styles.introContainer}>
        <div className={styles.introLayout}>
          <div className={styles.introImage}>
            <Image
              src="/images/story/story-intro.jpg.jpg"
              alt="أسرة منتجة تعمل على إعداد منتجات محلية"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div className={styles.introContent}>
            <p
              style={{
                margin: `0 0 ${t.spacing["6"]}`,
                color: t.colors.primary[800],
                fontSize: t.typography.fontSize["2xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              في كل بيت حكاية.
            </p>

            <div className={styles.introText}>
              <p>
                وفي كل أسرة منتجة شيء صنعته الأيدي قبل أن تصله الأسواق؛ وصفة
                تتوارثها الأمهات، حرفة تعلمتها العائلة، قطعة تحمل ملامح المكان،
                أو منتج شعبي يرتبط بذكرى قديمة لا تُنسى.
              </p>

              <p>
                لكن كثيرًا من هذه الأشياء بقيت قريبة من الناس وبعيدة عن السوق
                الرقمي.
              </p>

              <p className={styles.highlight}>
                من هنا بدأت بسطة.
              </p>

              <p>
                لم نرد أن نبني متجرًا إلكترونيًا آخر يضع صورة المنتج وسعره وزر
                &quot;اشترِ الآن&quot; وينتهي الأمر.
              </p>

              <p className={styles.finalStatement}>
                أردنا أن نبني مكانًا يشعر فيه الناس أن وراء كل منتج إنسانًا
                وقصة وذاكرة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}