// components/home/HeroSection.tsx
import { Landmark, ArrowLeft } from "lucide-react";
import { t } from "@/theme";

export default function HeroSection({ showStartStore }: { showStartStore: boolean }) {
  return (
    <section
      aria-labelledby="hero-heading"
      style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["6"]} ${t.spacing["4"]} 0` }}
    >
      <div
        style={{
          borderRadius: t.radius.xl,
          overflow: "hidden",
          background: t.colors.cream.warm,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "stretch",
          position: "relative",
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: t.shadows.sm,
        }}
        className="basita-hero-grid"
      >
        {/* قسم النصوص والأزرار التفاعلية (على اليمين) */}
        <div
          style={{
            padding: t.spacing["10"],
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          className="basita-hero-content"
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-start",
              background: t.colors.primary[100],
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              padding: `${t.spacing["1"]} ${t.spacing["3"]}`,
              borderRadius: t.radius.full,
              marginBottom: t.spacing["4"],
            }}
            className="basita-hero-eyebrow"
          >
            <Landmark size={13} strokeWidth={2} aria-hidden="true" />
            منصة سعودية للأسر المنتجة
          </span>

          <h1
            id="hero-heading"
            style={{
              margin: `0 0 ${t.spacing["3"]}`,
              fontSize: t.typography.fontSize["4xl"],
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[900],
              lineHeight: t.typography.lineHeight.tight,
              textWrap: "balance",
            }}
            className="basita-hero-title"
          >
            ادعم الأسر المنتجة
            <br />
            واكتشف منتجات سعودية أصلية
          </h1>

          <p
            style={{
              margin: `0 0 ${t.spacing["6"]}`,
              fontSize: t.typography.fontSize.md,
              color: t.colors.text.body,
              lineHeight: t.typography.lineHeight.relaxed,
              maxWidth: 460,
            }}
          >
            منصة بسطة تجمع أفضل المنتجات من الأسر السعودية المنتجة بجودة وشغف وحب.
          </p>

          <div style={{ display: "flex", gap: t.spacing["3"], flexWrap: "wrap", alignItems: "center" }}>
            <a
              href="/marketplace"
              className="basita-btn-interactive"
              style={{
                padding: `14px ${t.spacing["6"]}`,
                background: t.colors.primary[800],
                color: t.colors.text.onDark,
                borderRadius: t.radius.md,
                fontWeight: t.typography.fontWeight.bold,
                fontSize: t.typography.fontSize.base,
                textDecoration: "none",
              }}
            >
              تسوّق الآن
            </a>

            <a
              href="/marketplace"
              className="basita-btn-interactive"
              style={{
                padding: `14px ${t.spacing["6"]}`,
                background: t.colors.white,
                border: `1.5px solid ${t.colors.cream.border}`,
                color: t.colors.primary[800],
                borderRadius: t.radius.md,
                fontWeight: t.typography.fontWeight.bold,
                fontSize: t.typography.fontSize.base,
                textDecoration: "none",
              }}
            >
              تصفح المتاجر
            </a>

            {showStartStore && (
              <a
                href="/register"
                className="basita-btn-interactive"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: `14px ${t.spacing["4"]}`,
                  background: "transparent",
                  color: t.colors.gold[700],
                  fontWeight: t.typography.fontWeight.bold,
                  fontSize: t.typography.fontSize.base,
                  textDecoration: "none",
                }}
              >
                ابدأ متجرك مجاناً
                <ArrowLeft size={16} strokeWidth={2} style={{ transform: "rotate(180deg)" }} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* قسم الصورة / الخلفية البصرية (على اليسار) */}
        <div
          role="img"
          aria-label="تشكيلة من المنتجات السعودية الأصيلة من الأسر المنتجة: تمور وعسل وعطور ومنتجات يدوية"
          style={{
            position: "relative",
            minHeight: 380,
            background: `url(/images/hero-family.png) center/cover`,
          }}
          className="basita-hero-visual"
        >
          {/* تدرّج خفيف لضمان وضوح الشارة والمؤشرات فوق الصورة */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(18,63,50,0.28) 0%, rgba(18,63,50,0) 30%, rgba(18,63,50,0) 65%, rgba(18,63,50,0.35) 100%)",
            }}
          />

          {/* شارة صنع في السعودية */}
          <span
            style={{
              position: "absolute",
              top: t.spacing["5"],
              insetInlineStart: t.spacing["5"],
              background: t.colors.primary[900],
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              padding: `${t.spacing["2"]} ${t.spacing["3"]}`,
              borderRadius: t.radius.md,
              textAlign: "center",
              lineHeight: t.typography.lineHeight.tight,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              boxShadow: t.shadows.md,
            }}
          >
            صنع في
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Landmark size={13} strokeWidth={1.8} aria-hidden="true" />
              السعودية
            </span>
          </span>

          {/* مؤشرات شرائح الـ Hero (Dots) — زخرفية */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: t.spacing["5"],
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 6,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: i === 0 ? 22 : 6,
                  height: 6,
                  borderRadius: t.radius.full,
                  background: i === 0 ? t.colors.white : "rgba(255,255,255,0.6)",
                  transition: "width 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .basita-hero-grid { grid-template-columns: 1fr !important; }
          .basita-hero-visual { order: -1; min-height: 220px !important; }
          .basita-hero-content { padding: ${t.spacing["6"]} ${t.spacing["4"]} !important; text-align: center; align-items: center; }
          .basita-hero-eyebrow { align-self: center !important; }
          .basita-hero-content > div { justify-content: center; }
          .basita-hero-title { font-size: ${t.typography.fontSize["3xl"]} !important; }
        }
      `}</style>
    </section>
  );
}
