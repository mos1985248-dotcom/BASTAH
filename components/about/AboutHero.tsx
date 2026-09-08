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
    <section style={{ background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`, padding: `${t.spacing["16"]} ${t.spacing["4"]} ${t.spacing["12"]}`, textAlign: "center", direction: "rtl" }}>
      <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.gold[400], fontWeight: t.typography.fontWeight.bold, letterSpacing: 1 }}>
        قصتنا
      </p>
      <h1 style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.text.onDark, lineHeight: 1.35 }}>
        من بسطات الأمهات… إلى سوق رقمي يحكي الحكاية
      </h1>
      <p style={{ margin: "0 auto", maxWidth: 620, fontSize: t.typography.fontSize.base, color: t.colors.text.onDarkMuted, lineHeight: t.typography.lineHeight.relaxed }}>
        بسطة منصة سعودية تدعم الأسر المنتجة، وتمنح منتجاتهم الشعبية مساحة تستحقها — نجمع بين التراث والتقنية
        لنصل بمنتجاتنا من البيوت إلى كل مكان.
      </p>

      <div
        style={{
          display: "flex", justifyContent: "center", flexWrap: "wrap", gap: t.spacing["6"],
          maxWidth: 680, margin: `${t.spacing["12"]} auto 0`,
        }}
      >
        {PILLARS.map((p) => (
          <div key={p.pillar} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: t.spacing["2"], width: 130 }}>
            <div style={{ width: 56, height: 56, borderRadius: t.radius.full, background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.18)`, display: "flex", alignItems: "center", justifyContent: "center", color: t.colors.gold[400] }}>
              <PillarIcon pillar={p.pillar} />
            </div>
            <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.onDarkMuted, lineHeight: t.typography.lineHeight.snug, fontWeight: t.typography.fontWeight.medium }}>{p.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}