// components/about/company/CompanyHero.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./CompanyHero.module.css";

export default function CompanyHero() {
  return (
    <section
      style={{
        background: t.colors.cream.bg,
        padding: `${t.spacing["6"]} ${t.spacing["4"]} ${t.spacing["8"]}`,
        direction: "rtl",
      }}
    >
      <div
        className={styles.companyHeroGrid}
        style={{
          maxWidth: t.layout.containerMaxWidth,
          minHeight: 500,
          borderRadius: t.radius.xl,
          background: t.colors.cream.warm,
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: t.shadows.sm,
        }}
      >
        {/* زخرفة خفيفة */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            top: -150,
            right: -100,
            borderRadius: "50%",
            border: "1px solid rgba(201,151,58,0.15)",
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
            bottom: -120,
            left: "40%",
            borderRadius: "50%",
            background: "rgba(54,122,101,0.035)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* النص */}
        <div
          className={styles.textContent}
          style={{
            padding: "clamp(32px, 5vw, 60px)",
          }}
        >
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
            من نحن
          </div>

          <h1
            style={{
              margin: `0 0 ${t.spacing["5"]}`,
              maxWidth: 620,
              color: t.colors.primary[950],
              fontFamily: t.typography.fontFamily.heading,
              fontSize: "clamp(30px, 4vw, 44px)",
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.4,
              letterSpacing: "-0.025em",
            }}
          >
            بسطة تجمع الإبداع المحلي
            <span
              style={{
                display: "block",
                color: t.colors.primary[700],
                marginTop: 4,
              }}
            >
              في مساحة رقمية واحدة
            </span>
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 590,
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.base,
              lineHeight: 2,
            }}
          >
            نبني مساحة رقمية تساعد الأسر المنتجة وأصحاب المشاريع المحلية على
            عرض منتجاتهم وإدارة متاجرهم والوصول إلى عملائهم بطريقة بسيطة وواضحة.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: t.spacing["3"],
              marginTop: t.spacing["6"],
            }}
          >
            {[
              "منصة رقمية",
              "للمشاريع المحلية",
              "تجربة بسيطة",
              "أدوات متكاملة",
            ].map((item) => (
              <span
                key={item}
                style={{
                  padding: "8px 14px",
                  borderRadius: t.radius.full,
                  background: "rgba(255,255,255,0.8)",
                  border: `1px solid ${t.colors.cream.borderLight}`,
                  color: t.colors.primary[800],
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* الصورة */}
        <div
          className={styles.imagePanel}
          style={{
            background: t.colors.primary[50],
          }}
        >
          <Image
            src="/images/about/company-hero.jpg"
            alt="مشروع محلي ومنتجات سعودية"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{
              objectFit: "cover",
            }}
          />

          {/* طبقة خفيفة فوق الصورة */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(15,61,46,0.02), rgba(15,61,46,0.12))",
              pointerEvents: "none",
            }}
          />

          {/* شارة الصورة */}
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 24,
              zIndex: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: t.radius.md,
              background: "rgba(15,61,46,0.88)",
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium,
              boxShadow: t.shadows.md,
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: t.colors.gold[400],
                flexShrink: 0,
              }}
            />
            مشروع محلي ومنتجات سعودية
          </div>
        </div>
      </div>
    </section>
  );
}