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
          gridTemplateColumns: "1.02fr 0.98fr",
          alignItems: "stretch",
          minHeight: 440,
          borderRadius: t.radius.xl,
          background: t.colors.cream.warm,
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: t.shadows.sm,
        }}
      >
        {/* زخرفة خلفية خفيفة */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            top: -150,
            right: -105,
            border: "1px solid rgba(201,151,58,0.14)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            bottom: -125,
            left: "42%",
            background: "rgba(54,122,101,0.035)",
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
            padding: "clamp(32px, 5vw, 60px)",
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
              padding: "7px 13px",
              borderRadius: t.radius.full,
              background: t.colors.cream.card,
              border: `1px solid ${t.colors.gold[200]}`,
              color: t.colors.gold[700],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              boxShadow: t.shadows.xs,
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
              maxWidth: 650,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.3,
              color: t.colors.primary[950],
              letterSpacing: "-0.025em",
            }}
          >
            {/* السطر الأول */}
            <span
              style={{
                display: "block",
                fontSize: "clamp(28px, 3.1vw, 40px)",
                marginBottom: 8,
              }}
            >
              ادعم الأسر المنتجة
            </span>

            {/* السطر الثاني */}
            <span
              style={{
                display: "block",
                fontSize: "clamp(23px, 2.6vw, 32px)",
                lineHeight: 1.3,
                color: t.colors.primary[700],
                marginBottom: 5,
                fontWeight: t.typography.fontWeight.semibold,
              }}
            >
              واكتشف
            </span>

            {/* السطر الثالث */}
            <span
              style={{
                display: "block",
                fontSize: "clamp(28px, 3.1vw, 40px)",
                lineHeight: 1.3,
              }}
            >
              منتجات سعودية{" "}
              <span
                style={{
                  color: t.colors.gold[700],
                }}
              >
                أصيلة
              </span>
            </span>
          </h1>

          {/* الوصف */}
          <p
            style={{
              margin: `0 0 ${t.spacing["6"]}`,
              maxWidth: 600,
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
            {/* تسوق الآن */}
            <a
              href="/marketplace"
              className="basita-hero-primary basita-btn-interactive"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 48,
                padding: `0 ${t.spacing["6"]}`,
                background: t.colors.primary[800],
                color: t.colors.text.onDark,
                borderRadius: t.radius.md,
                fontWeight: t.typography.fontWeight.bold,
                fontSize: t.typography.fontSize.sm,
                textDecoration: "none",
                boxShadow: t.shadows.sm,
              }}
            >
              <ShoppingBag size={17} strokeWidth={1.9} />
              تسوّق الآن
            </a>

            {/* تصفح المتاجر */}
            <a
              href="/marketplace"
              className="basita-hero-secondary basita-btn-interactive"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 48,
                padding: `0 ${t.spacing["5"]}`,
                background: t.colors.cream.card,
                border: `1px solid ${t.colors.cream.border}`,
                color: t.colors.primary[800],
                borderRadius: t.radius.md,
                fontWeight: t.typography.fontWeight.semibold,
                fontSize: t.typography.fontSize.sm,
                textDecoration: "none",
                boxShadow: t.shadows.xs,
              }}
            >
              <Store size={17} strokeWidth={1.9} />
              تصفح المتاجر
            </a>

            {/* ابدأ متجرك مجانًا */}
            {showStartStore && (
              <a
                href="/register"
                className="basita-hero-store-cta basita-btn-interactive"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  minHeight: 48,
                  padding: `0 ${t.spacing["4"]}`,
                  background: t.colors.gold[50],
                  border: `1px solid ${t.colors.gold[600]}`,
                  color: t.colors.gold[700],
                  borderRadius: t.radius.md,
                  fontWeight: t.typography.fontWeight.bold,
                  fontSize: t.typography.fontSize.sm,
                  textDecoration: "none",
                  boxShadow: t.shadows.xs,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: t.colors.gold[600],
                    flexShrink: 0,
                  }}
                />

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

          {/* سطر الثقة */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: t.spacing["5"],
              padding: "7px 11px",
              borderRadius: t.radius.full,
              background: "rgba(54,122,101,0.055)",
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: t.colors.primary[500],
                flexShrink: 0,
              }}
            />

            منتجات محلية من أسر سعودية منتجة
          </div>
        </div>

        {/* الصور */}
        <div
          className="basita-hero-visual"
          style={{
            position: "relative",
            minHeight: 440,
            overflow: "hidden",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* الصور الثلاث */}
          <div
            className="basita-hero-slides"
            aria-label="صور من سوق بسطة"
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              borderRadius: t.radius.xl,
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
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "transparent",
                }}
              />
            ))}
          </div>

          {/* بطاقة صنع في السعودية */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              zIndex: 4,
              minWidth: 112,
              padding: "10px 12px",
              borderRadius: t.radius.md,
              background: "rgba(15,61,46,0.88)",
              color: t.colors.text.onDark,
              textAlign: "center",
              boxShadow: t.shadows.md,
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.12)",
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
                color: t.colors.gold[300],
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              <Landmark size={14} strokeWidth={1.8} />
              السعودية
            </div>
          </div>

          {/* مؤشرات الصور */}
          <div
            className="basita-hero-dots"
            style={{
              position: "absolute",
              bottom: 24,
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
                borderRadius: t.radius.full,
                background: t.colors.cream.card,
                opacity: 0.95,
              }}
            />

            <span
              className="basita-hero-dot basita-hero-dot-2"
              style={{
                width: 6,
                height: 6,
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.45)",
              }}
            />

            <span
              className="basita-hero-dot basita-hero-dot-3"
              style={{
                width: 6,
                height: 6,
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.45)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}