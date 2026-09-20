
// components/about/AboutPeopleFirst.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutPeopleFirst.module.css";

export default function AboutPeopleFirst() {
  return (
    <section
      style={{
        background: t.colors.cream.warm,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* الصورة */}
          <div className={styles.image}>
            <Image
              src="/images/story/story-people.jpg.jpg"
              alt="أشخاص من المجتمع المحلي يتشاركون تجربة ومشروعًا"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          {/* المحتوى */}
          <div className={styles.content}>
            <p className={styles.eyebrow}>الناس أولًا</p>

            <h2
              style={{
                margin: 0,
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              بسطة تبدأ من الناس
            </h2>

            <div className={styles.text}>
              <p>
                لا نريد أن نبني منصة بمعزل عن السوق ثم نطلب من الناس استخدامها.
              </p>

              <p className={styles.highlight}>
                نريد أن نتعلم منهم.
              </p>

              <p>
                سنبدأ مع عدد محدود من الأسر المنتجة، ونستمع إلى تجربتهم، ونراقب
                كيف يستخدمون المنصة، وما الذي يحتاجونه، وما الذي يمكن أن نجعله
                أبسط.
              </p>

              <p>
                ثم نستمع إلى العملاء أيضًا.
              </p>

              <p>
                لأن أفضل نسخة من بسطة لن تأتي من التخمين.
              </p>

              <p className={styles.finalStatement}>
                ستأتي من الناس الذين يستخدمونها.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
