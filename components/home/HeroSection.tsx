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
          className="basita-hero-decoration-top"
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
          className="basita-hero-decoration-bottom"
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
            className="basita-hero-badge"
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
            className="basita-hero-title"
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
            <span
              style={{
                display: "block",
                fontSize: "clamp(28px, 3.1vw, 40px)",
                marginBottom: 8,
              }}
            >
              ادعم الأسر المنتجة
            </span>

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
            className="basita-hero-description"
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
            className="basita-hero-trust"
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
            className="basita-hero-made-card"
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

      {/* Responsive mobile */}
      <style jsx>{`
        @media (max-width: 767px) {
          section {
            padding: 10px 10px 0 !important;
          }

          .basita-hero-grid {
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            border-radius: 18px !important;
          }

          .basita-hero-visual {
            order: 1;
            width: 100%;
            min-height: 0 !important;
            height: clamp(205px, 58vw, 270px) !important;
            flex: none !important;
            border-radius: 18px 18px 0 0;
          }

          .basita-hero-slides {
            border-radius: 18px 18px 0 0 !important;
          }

          .basita-hero-slide {
            background-size: cover !important;
            background-position: center !important;
          }

          .basita-hero-made-card {
            top: 12px !important;
            left: 12px !important;
            min-width: 0 !important;
            padding: 7px 9px !important;
            border-radius: 10px !important;
          }

          .basita-hero-made-card > div:first-child {
            font-size: 10px !important;
          }

          .basita-hero-made-card > div:last-child {
            font-size: 11px !important;
            gap: 4px !important;
          }

          .basita-hero-made-card svg {
            width: 12px !important;
            height: 12px !important;
          }

          .basita-hero-dots {
            bottom: 10px !important;
            gap: 5px !important;
          }

          .basita-hero-dot-1 {
            width: 18px !important;
            height: 5px !important;
          }

          .basita-hero-dot-2,
          .basita-hero-dot-3 {
            width: 5px !important;
            height: 5px !important;
          }

          .basita-hero-content {
            order: 2;
            width: 100%;
            box-sizing: border-box;
            padding: 22px 18px 20px !important;
            align-items: stretch !important;
          }

          .basita-hero-badge {
            align-self: flex-start;
            margin-bottom: 12px !important;
            padding: 6px 10px !important;
            font-size: 11px !important;
          }

          .basita-hero-badge > span {
            width: 6px !important;
            height: 6px !important;
          }

          .basita-hero-title {
            margin-bottom: 12px !important;
            letter-spacing: -0.02em !important;
          }

          .basita-hero-title > span:first-child {
            font-size: 26px !important;
            margin-bottom: 3px !important;
            line-height: 1.35 !important;
          }

          .basita-hero-title > span:nth-child(2) {
            font-size: 20px !important;
            margin-bottom: 2px !important;
            line-height: 1.35 !important;
          }

          .basita-hero-title > span:nth-child(3) {
            font-size: 25px !important;
            line-height: 1.35 !important;
          }

          .basita-hero-description {
            margin-bottom: 16px !important;
            font-size: 14px !important;
            line-height: 1.8 !important;
          }

          .basita-hero-actions {
            width: 100%;
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 8px !important;
          }

          .basita-hero-actions a {
            min-height: 43px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
            font-size: 13px !important;
            gap: 6px !important;
          }

          .basita-hero-primary {
            grid-column: 1 / -1;
          }

          .basita-hero-store-cta {
            grid-column: 1 / -1;
          }

          .basita-hero-trust {
            align-self: flex-start;
            margin-top: 14px !important;
            padding: 6px 9px !important;
            font-size: 10px !important;
          }

          .basita-hero-decoration-top {
            width: 150px !important;
            height: 150px !important;
            top: -95px !important;
            right: -80px !important;
          }

          .basita-hero-decoration-bottom {
            width: 120px !important;
            height: 120px !important;
            bottom: -85px !important;
            left: -45px !important;
          }
        }

        @media (max-width: 420px) {
          section {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .basita-hero-content {
            padding: 20px 15px 18px !important;
          }

          .basita-hero-title > span:first-child {
            font-size: 24px !important;
          }

          .basita-hero-title > span:nth-child(2) {
            font-size: 19px !important;
          }

          .basita-hero-title > span:nth-child(3) {
            font-size: 23px !important;
          }

          .basita-hero-description {
            font-size: 13px !important;
            line-height: 1.75 !important;
          }

          .basita-hero-actions a {
            font-size: 12px !important;
          }

          .basita-hero-trust {
            max-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}