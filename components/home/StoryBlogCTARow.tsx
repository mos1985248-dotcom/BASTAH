// components/home/StoryBlogCTARow.tsx
// روابط "قصتنا" و"المدونة" تشير لصفحات خارطة الطريق الحالية.

import { ArrowLeft, BookOpen, Heart, Store } from "lucide-react";
import { t } from "@/theme";

export default function StoryBlogCTARow({
  showStartStore,
}: {
  showStartStore: boolean;
}) {
  return (
    <section
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["10"]} ${t.spacing["4"]} 0`,
        direction: "rtl",
      }}
    >
      <div
        className="basita-story-row"
        style={{
          display: "grid",
          gridTemplateColumns: showStartStore
            ? "1fr 1fr 1.25fr"
            : "1fr 1fr",
          gap: t.spacing["4"],
          alignItems: "stretch",
        }}
      >
        {/* قصتنا */}
        <a
          href="/about#story"
          className="basita-story-card"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: t.spacing["5"],
            textDecoration: "none",
            borderRadius: t.radius.lg,
            background: t.colors.cream.card,
            border: `1px solid ${t.colors.cream.borderLight}`,
            boxShadow: t.shadows.xs,
            boxSizing: "border-box",
            transition:
              `transform ${t.motion.base} ${t.motion.ease}, ` +
              `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
              `border-color ${t.motion.base} ${t.motion.ease}`,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: t.radius.full,
              top: -62,
              left: -52,
              border: `1px solid rgba(201,151,58,0.12)`,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                width: 44,
                height: 44,
                marginBottom: t.spacing["3"],
                borderRadius: t.radius.md,
                background: t.colors.gold[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                size={21}
                strokeWidth={1.8}
                color={t.colors.gold[700]}
              />
            </div>

            <h3
              style={{
                margin: `0 0 ${t.spacing["2"]}`,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
              }}
            >
              قصتنا
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                color: t.colors.text.mid,
                lineHeight: t.typography.lineHeight.relaxed,
              }}
            >
              من فكرة بسيطة إلى منصة تدعم الأسر السعودية المنتجة وتصنع أثرًا
              حقيقيًا.
            </p>
          </div>

          <span
            style={{
              position: "relative",
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: t.typography.fontSize.sm,
              color: t.colors.gold[700],
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            اقرأ قصتنا
            <ArrowLeft
              size={15}
              strokeWidth={2.1}
              style={{ transform: "rotate(180deg)" }}
            />
          </span>
        </a>

        {/* المدونة */}
        <a
          href="/blog"
          className="basita-story-card"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: t.spacing["5"],
            textDecoration: "none",
            borderRadius: t.radius.lg,
            background: t.colors.cream.card,
            border: `1px solid ${t.colors.cream.borderLight}`,
            boxShadow: t.shadows.xs,
            boxSizing: "border-box",
            transition:
              `transform ${t.motion.base} ${t.motion.ease}, ` +
              `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
              `border-color ${t.motion.base} ${t.motion.ease}`,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: t.radius.full,
              bottom: -68,
              right: -52,
              border: `1px solid rgba(201,151,58,0.12)`,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                width: 44,
                height: 44,
                marginBottom: t.spacing["3"],
                borderRadius: t.radius.md,
                background: t.colors.gold[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen
                size={21}
                strokeWidth={1.8}
                color={t.colors.gold[700]}
              />
            </div>

            <h3
              style={{
                margin: `0 0 ${t.spacing["2"]}`,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
              }}
            >
              المدونة
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                color: t.colors.text.mid,
                lineHeight: t.typography.lineHeight.relaxed,
              }}
            >
              تعرّف على قصص ملهمة ونصائح لرواد الأعمال وأخبار الأسر المنتجة.
            </p>
          </div>

          <span
            style={{
              position: "relative",
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: t.typography.fontSize.sm,
              color: t.colors.gold[700],
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            تصفّح المدونة
            <ArrowLeft
              size={15}
              strokeWidth={2.1}
              style={{ transform: "rotate(180deg)" }}
            />
          </span>
        </a>

        {/* ابدأ متجرك */}
        {showStartStore && (
          <a
            href="/register"
            className="basita-story-cta"
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: t.spacing["5"],
              textDecoration: "none",
              borderRadius: t.radius.lg,
              background: `linear-gradient(145deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`,
              boxShadow: t.shadows.sm,
              boxSizing: "border-box",
              transition:
                `transform ${t.motion.base} ${t.motion.ease}, ` +
                `box-shadow ${t.motion.base} ${t.motion.ease}`,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: t.radius.full,
                top: -100,
                left: -70,
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  marginBottom: t.spacing["3"],
                  borderRadius: t.radius.md,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Store
                  size={22}
                  strokeWidth={1.8}
                  color={t.colors.gold[400]}
                />
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginBottom: 8,
                  color: t.colors.gold[400],
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                }}
              >
                فرصتك تبدأ هنا
              </div>

              <h3
                style={{
                  margin: `0 0 ${t.spacing["2"]}`,
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.text.onDark,
                }}
              >
                ابدأ متجرك مجانًا
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.sm,
                  color: t.colors.text.onDarkMuted,
                  lineHeight: t.typography.lineHeight.relaxed,
                }}
              >
                انضم إلى الأسر المنتجة على بسطة وابدأ رحلتك في بيع منتجاتك
                والوصول إلى عملاء جدد.
              </p>
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <span
                className="basita-story-cta-button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  minHeight: 42,
                  padding: `0 ${t.spacing["5"]}`,
                  background: t.colors.gold[600],
                  color: t.colors.white,
                  borderRadius: t.radius.md,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.bold,
                  boxShadow: t.shadows.gold,
                  transition:
                    `transform ${t.motion.fast} ${t.motion.ease}, ` +
                    `box-shadow ${t.motion.fast} ${t.motion.ease}`,
                }}
              >
                ابدأ مجانًا
                <ArrowLeft
                  size={15}
                  strokeWidth={2}
                  style={{ transform: "rotate(180deg)" }}
                />
              </span>
            </div>
          </a>
        )}
      </div>
    </section>
  );
}