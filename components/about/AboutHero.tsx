// components/about/AboutHero.tsx

import { t } from "@/theme";
import PillarIcon, { Pillar } from "./PillarIcon";

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
        background: `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[800]})`,
        padding: `${t.spacing["16"]} ${t.spacing["5"]} ${t.spacing["12"]}`,
        textAlign: "center",
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            margin: `0 0 ${t.spacing["3"]}`,
            color: t.colors.gold[400],
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            letterSpacing: 1,
          }}
        >
          قصتنا
        </p>

        <h1
          style={{
            maxWidth: 820,
            margin: `0 auto ${t.spacing["5"]}`,
            color: t.colors.text.onDark,
            fontSize: t.typography.fontSize["4xl"],
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.45,
          }}
        >
          من بسطات الأمهات… إلى سوق رقمي يحكي الحكاية
        </h1>

        <p
          style={{
            maxWidth: 680,
            margin: "0 auto",
            color: t.colors.text.onDarkMuted,
            fontSize: t.typography.fontSize.base,
            lineHeight: 2,
          }}
        >
          بسطة منصة سعودية تدعم الأسر المنتجة، وتمنح منتجاتهم الشعبية مساحة
          تستحقها — نجمع بين التراث والتقنية لنصل بمنتجاتنا من البيوت إلى كل
          مكان.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(130px, 1fr))",
            gap: t.spacing["4"],
            maxWidth: 760,
            margin: `${t.spacing["12"]} auto 0`,
          }}
        >
          {PILLARS.map(({ pillar, label }) => (
            <div
              key={pillar}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: t.spacing["3"],
                minHeight: 120,
                padding: `${t.spacing["3"]} ${t.spacing["2"]}`,
                borderRadius: t.radius.xl,
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: t.radius.full,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.colors.gold[400],
                }}
              >
                <PillarIcon pillar={pillar} />
              </div>

              <span
                style={{
                  maxWidth: 120,
                  color: t.colors.text.onDarkMuted,
                  fontSize: t.typography.fontSize.xs,
                  lineHeight: 1.7,
                  fontWeight: t.typography.fontWeight.medium,
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