
// components/about/AboutClosing.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutClosing.module.css";

export default function AboutClosing() {
  return (
    <section
      style={{
        background: t.colors.cream.warm,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.container}>
        {/* الصورة */}
        <div className={styles.image}>
          <Image
            src="/images/story/story-closing.jpg.jpg"
            alt="مشهد ختامي يعكس روح بسطة والأسواق المحلية"
            fill
            sizes="(max-width: 900px) 100vw, 1180px"
            style={{
              objectFit: "cover",
            }}
          />
        </div>

        {/* النص */}
        <div className={styles.intro}>
          <p className={styles.eyebrow}>هذه هي بسطة</p>

          <h2
            style={{
              margin: `0 0 ${t.spacing["5"]}`,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize["3xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.5,
            }}
          >
            هذه هي بسطة
          </h2>

          <div className={styles.text}>
            <p>
              بسطة ليست مجرد مكان لبيع المنتجات، بل مساحة رقمية تحمل شيئًا من
              روح الأسواق القديمة، حيث القرب، والحكاية، والثقة.
            </p>

            <p>
              مكان تستطيع فيه الأسرة أن تعرض ما تصنعه، ويكتشف فيه العميل
              منتجات جديدة، وتجد فيه الحكايات القديمة طريقها إلى جيل جديد.
            </p>

            <p>
              نؤمن أن دعم الأسرة المنتجة هو جوهر ما بدأنا من أجله، وأن المنتج
              الشعبي لا يقتصر على كونه سلعة، بل يحمل خلفه قصة وذاكرة وحرفة
              وهوية تستحق أن تصل إلى الناس.
            </p>

            <p className={styles.highlight}>
              المنتج الشعبي ليس مجرد سلعة؛ بل قصة وذاكرة وحرفة وهوية تستحق أن
              تُرى.
            </p>
          </div>
        </div>

        {/* الخاتمة المختصرة */}
        <div className={styles.finalCard}>
          <p className={styles.brand}>بسطة</p>

          <p className={styles.subtitle}>
            دعم الأسرة المنتجة.
          </p>

          <p className={styles.description}>
            نأخذ روح البسطة القديمة، ونمنحها مكانًا جديدًا في العالم الرقمي.
          </p>

          {/* الأزرار */}
          <div className={styles.actions}>
            <a
              href="/marketplace"
              className="basita-btn-interactive"
              style={{
                minWidth: 145,
                padding: "11px 24px",
                background: t.colors.gold[600],
                color: t.colors.primary[950],
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                textDecoration: "none",
              }}
            >
              تسوّقي الآن
            </a>

            <a
              href="/register"
              className="basita-btn-interactive"
              style={{
                minWidth: 145,
                padding: "11px 24px",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: t.colors.white,
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                textDecoration: "none",
              }}
            >
              ابدأ متجرك
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
