// components/home/HeroSection.tsx
import {
  Landmark,
  ArrowLeft,
  ShoppingBag,
  Store,
} from "lucide-react";
import { t } from "@/theme";

const HERO_IMAGES = [
  "/images/hero-1.webp.jpg",
  "/images/hero-2.webp.jpg",
  "/images/hero-3.webp.jpg",
];

export default function HeroSection({
  showStartStore,
}: {
  showStartStore: boolean;
}) {
  return (
    <section
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["6"]} ${t.spacing["4"]} 0`,
        direction: "rtl",
      }}
    >
      <div
        className="basita-hero-grid"
        style={{
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.03fr 0.97fr",
          alignItems: "stretch",
          minHeight: 440,
          borderRadius: 26,
          background: "#F7F1E5",
          border: "1px solid rgba(91,70,45,0.12)",
          boxShadow: "0 8px 24px rgba(67,48,29,0.055)",
        }}
      >
        {/* الزخرفة */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            top: -125,
            right: -95,
            border: "1px solid rgba(166,124,45,0.12)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* المحتوى */}
        <div
          className="basita-hero-content"
          style={{
            position: "relative",
            zIndex: 3,
            padding: "clamp(28px, 4.5vw, 52px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* الشارة */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: t.spacing["4"],
              padding: "7px 12px",
              borderRadius: 999,
              background: "#FFFDF8",
              border: "1px solid rgba(166,124,45,0.18)",
              color: t.colors.gold[700],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              boxShadow: "0 3px 10px rgba(67,48,29,0.035)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: t.colors.gold[600],
                flexShrink: 0,
              }}
            />

            من قلب السوق السعودي
          </div>

          {/* العنوان */}
          <h1
            style={{
              fontFamily: t.typography.fontFamily.heading,
              margin: `0 0 ${t.spacing["4"]}`,
              maxWidth: 620,
              fontSize: "clamp(28px, 3.2vw, 42px)",
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.35,
              color: t.colors.primary[900],
              letterSpacing: "-0.025em",
            }}
          >
            ادعم الأسر المنتجة
            <br />
            واكتشف منتجات سعودية
            <span style={{ color: t.colors.gold[700] }}> أصيلة</span>
          </h1>

          {/* الوصف */}
          <p
            style={{
              margin: `0 0 ${t.spacing["6"]}`,
              maxWidth: 580,
              fontSize: t.typography.fontSize.base,
              color: t.colors.text.body,
              lineHeight: t.typography.lineHeight.relaxed,
            }}
          >
            سوق يجمع لك منتجات الأسر السعودية المنتجة في مكان واحد، من التمور
            والعطور إلى الأطعمة والهدايا والمنتجات اليدوية.
          </p>

          {/* الأزرار */}
          <div
            className="basita-hero-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: t.spacing["3"],
              flexWrap: "wrap",
            }}
          >
            <a
              href="/marketplace"
              className="basita-hero-primary basita-btn-interactive"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 46,
                padding: `0 ${t.spacing["6"]}`,
                background: t.colors.primary[800],
                color: t.colors.text.onDark,
                borderRadius: 13,
                fontWeight: t.typography.fontWeight.bold,
                fontSize: t.typography.fontSize.sm,
                textDecoration: "none",
                boxShadow: "0 6px 14px rgba(33,53,42,0.14)",
              }}
            >
              <ShoppingBag size={17} strokeWidth={1.9} />
              تسوّق الآن
            </a>

            <a
              href="/marketplace"
              className="basita-hero-secondary basita-btn-interactive"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 46,
                padding: `0 ${t.spacing["5"]}`,
                background: "#FFFDF8",
                border: "1px solid rgba(91,70,45,0.14)",
                color: t.colors.primary[800],
                borderRadius: 13,
                fontWeight: t.typography.fontWeight.semibold,
                fontSize: t.typography.fontSize.sm,
                textDecoration: "none",
              }}
            >
              <Store size={17} strokeWidth={1.9} />
              تصفح المتاجر
            </a>

            {showStartStore && (
              <a
                href="/register"
                className="basita-hero-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 46,
                  padding: `0 ${t.spacing["3"]}`,
                  color: t.colors.gold[700],
                  fontWeight: t.typography.fontWeight.bold,
                  fontSize: t.typography.fontSize.sm,
                  textDecoration: "none",
                }}
              >
                ابدأ متجرك مجانًا

                <ArrowLeft
                  size={16}
                  strokeWidth={2}
                  style={{
                    transform: "rotate(180deg)",
                  }}
                />
              </a>
            )}
          </div>
        </div>

        {/* الصور */}
        <div
          className="basita-hero-visual"
          style={{
            position: "relative",
            minHeight: 440,
            overflow: "hidden",
            background: t.colors.primary[800],
          }}
        >
          {/* الصور الثلاث */}
          <div
            className="basita-hero-slides"
            aria-label="صور من سوق بسطة"
            style={{
              position: "absolute",
              inset: 0,
            }}
          >
            {HERO_IMAGES.map((src, index) => (
              <div
                key={src}
                className={`basita-hero-slide basita-hero-slide-${
                  index + 1
                }`}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ))}
          </div>

          {/* تظليل الصورة */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,61,46,0.03) 0%, rgba(15,61,46,0.12) 55%, rgba(15,61,46,0.30) 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* بطاقة صنع في السعودية */}
          <div
            style={{
              position: "absolute",
              top: 22,
              left: 22,
              zIndex: 4,
              minWidth: 106,
              padding: "9px 11px",
              borderRadius: 14,
              background: "rgba(28,42,34,0.90)",
              color: t.colors.text.onDark,
              textAlign: "center",
              boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                marginBottom: 3,
              }}
            >
              صنع في
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                color: "#F4D47C",
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              <Landmark size={14} strokeWidth={1.8} />
              السعودية
            </div>
          </div>

          {/* الإطار الداخلي */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 16,
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: 21,
              pointerEvents: "none",
              zIndex: 3,
            }}
          />

          {/* مؤشرات الصور */}
          <div
            className="basita-hero-dots"
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 4,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              className="basita-hero-dot basita-hero-dot-1"
              style={{
                width: 22,
                height: 6,
                borderRadius: 999,
                background: "#FFFDF8",
                opacity: 0.95,
              }}
            />

            <span
              className="basita-hero-dot basita-hero-dot-2"
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "rgba(255,255,255,0.45)",
              }}
            />

            <span
              className="basita-hero-dot basita-hero-dot-3"
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "rgba(255,255,255,0.45)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}