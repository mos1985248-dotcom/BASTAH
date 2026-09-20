
import Image from "next/image";
import { t } from "@/theme";
import PillarIcon, { Pillar } from "./PillarIcon";
import styles from "./AboutHero.module.css";

const PILLARS: { pillar: Pillar; label: string }[] = [
  { pillar: "saudi", label: "من المملكة إلى العالم" },
  { pillar: "community", label: "دعم الأسرة المنتجة" },
  { pillar: "products", label: "منتجات شعبية أصيلة" },
  { pillar: "secure", label: "تجربة آمنة وسهلة" },
];

export default function AboutHero() {
  return (
    <section
      style={{
        background: t.colors.cream.bg,
        padding: `${t.spacing["12"]} ${t.spacing["5"]} ${t.spacing["16"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.heroContainer}>
        <div className={styles.heroLayout}>
          <div className={styles.heroContent}>
            <p
              style={{
                margin: `0 0 ${t.spacing["3"]}`,
                color: t.colors.gold[600],
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              قصتنا
            </p>

            <h1
              style={{
                margin: `0 0 ${t.spacing["5"]}`,
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["4xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.45,
              }}
            >
              من بسطات الأمهات…
              <br />
              إلى سوق رقمي يحكي الحكاية
            </h1>

            <p
              className={styles.heroDescription}
              style={{
                color: t.colors.text.body,
                fontSize: t.typography.fontSize.base,
                lineHeight: 2,
              }}
            >
              بسطة منصة سعودية تدعم الأسر المنتجة، وتمنح منتجاتهم الشعبية
              مساحة تستحقها — نجمع بين التراث والتقنية لنصل بمنتجاتنا من
              البيوت إلى كل مكان.
            </p>
          </div>

          <div className={styles.heroImage}>
            <Image
              src="/images/story/story-hero.jpg.jpg"
              alt="مشهد من الأسواق والبسطات المحلية في المملكة"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        <div
          className={styles.pillars}
          style={{
            background: t.colors.primary[950],
          }}
        >
          {PILLARS.map(({ pillar, label }) => (
            <div key={pillar} className={styles.pillar}>
              <div
                className={styles.pillarIcon}
                style={{
                  color: t.colors.gold[400],
                }}
              >
                <PillarIcon pillar={pillar} />
              </div>

              <span
                style={{
                  color: t.colors.text.onDark,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  lineHeight: 1.7,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

