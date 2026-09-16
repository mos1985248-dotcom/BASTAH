// components/auth/AuthShell.tsx
// القالب المشترك لصفحات المصادقة (Login/Register/Reset).
// يحافظ على نفس الهيكل المشترك مع تحسين الهوية البصرية لبسطة.

import Image from "next/image";
import { t } from "@/theme";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="basita-auth-shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row-reverse",
        background: t.colors.cream.bg,
      }}
    >
      {/* لوحة الهوية */}
      <aside
        className="basita-auth-brand"
        style={{
          flex: "1 1 46%",
          minHeight: "100vh",
          background:
            `linear-gradient(150deg, ${t.colors.primary[950]} 0%, ` +
            `${t.colors.primary[900]} 45%, ${t.colors.primary[700]} 100%)`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(32px, 5vw, 64px)",
          direction: "rtl",
        }}
      >
        {/* زخرفة هندسية */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage: `radial-gradient(${t.colors.gold[400]} 1.5px, transparent 1.5px)`,
            backgroundSize: "26px 26px",
            pointerEvents: "none",
          }}
        />

        {/* دوائر زخرفية */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            top: -190,
            left: -150,
            border: "1px solid rgba(239,220,176,0.16)",
            pointerEvents: "none",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            bottom: -160,
            right: -120,
            border: "1px solid rgba(239,220,176,0.12)",
            pointerEvents: "none",
          }}
        />

        {/* الهوية */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: t.spacing["3"],
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
            }}
          >
            <Image
              src="/images/logo-icon.png"
              alt="بسطة"
              width={36}
              height={36}
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
              }}
            />
          </div>

          <div>
            <div
              style={{
                fontFamily: t.typography.fontFamily.heading,
                color: t.colors.text.onDark,
                fontSize: "22px",
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.15,
              }}
            >
              بسطة
            </div>

            <div
              style={{
                marginTop: 3,
                fontFamily: t.typography.fontFamily.heading,
                color: t.colors.text.onDarkMuted,
                fontSize: "10px",
                fontWeight: t.typography.fontWeight.medium,
                lineHeight: 1.3,
              }}
            >
              منصة الأسر المنتجة السعودية
            </div>
          </div>
        </div>

        {/* الرسالة */}
        <div
          style={{
            position: "relative",
            maxWidth: 560,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: t.spacing["4"],
              padding: "7px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(239,220,176,0.16)",
              color: t.colors.gold[400],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: t.colors.gold[400],
              }}
            />
            من قلب السوق السعودي
          </div>

          <h2
            style={{
              fontFamily: t.typography.fontFamily.heading,
              color: t.colors.text.onDark,
              fontSize: "clamp(28px, 3vw, 42px)",
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.4,
              margin: `0 0 ${t.spacing["4"]}`,
              letterSpacing: "-0.02em",
            }}
          >
            ادعم الأسر المنتجة
            <br />
            واكتشف منتجات سعودية أصيلة
          </h2>

          <p
            style={{
              color: t.colors.text.onDarkMuted,
              fontSize: t.typography.fontSize.md,
              lineHeight: t.typography.lineHeight.relaxed,
              margin: 0,
              maxWidth: 470,
            }}
          >
            منصة بسطة تجمع منتجات الأسر السعودية المنتجة في مكان واحد، لتكتشف
            منتجات محلية أصيلة وتدعم أصحاب المشاريع الصغيرة.
          </p>
        </div>

        {/* المزايا */}
        <div
          style={{
            position: "relative",
            display: "flex",
            gap: t.spacing["4"],
            flexWrap: "wrap",
          }}
        >
          {[
            "دعم الأسرة المنتجة",
            "منتجات سعودية أصيلة",
            "تجربة تسوق سهلة",
          ].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.onDarkMuted,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: t.radius.full,
                  background: t.colors.gold[400],
                  flexShrink: 0,
                }}
              />

              {label}
            </div>
          ))}
        </div>
      </aside>

      {/* مساحة النموذج */}
      <main
        className="basita-auth-main"
        style={{
          flex: "1 1 54%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px, 5vw, 64px)",
          direction: "rtl",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 430,
          }}
        >
          {/* شعار الجوال */}
          <div
            className="basita-auth-mobile-logo"
            style={{
              display: "none",
              justifyContent: "center",
              marginBottom: t.spacing["5"],
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "#FFFFFF",
                border: `1px solid ${t.colors.cream.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 6px 18px rgba(67,48,29,0.07)",
              }}
            >
              <Image
                src="/images/logo-icon.png"
                alt="بسطة"
                width={42}
                height={42}
                style={{
                  width: 42,
                  height: 42,
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* العنوان */}
          {title && (
            <h1
              style={{
                fontFamily: t.typography.fontFamily.heading,
                margin: 0,
                fontSize: t.typography.fontSize["2xl"],
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {title}
            </h1>
          )}

          {/* الوصف */}
          {subtitle && (
            <p
              style={{
                margin: `${t.spacing["2"]} 0 ${t.spacing["8"]}`,
                fontSize: t.typography.fontSize.base,
                color: t.colors.text.mid,
                textAlign: "center",
                lineHeight: t.typography.lineHeight.relaxed,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* النموذج */}
          <div
            style={{
              background: t.colors.cream.card,
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: 22,
              padding: "clamp(22px, 4vw, 30px)",
              boxShadow: "0 12px 34px rgba(67,48,29,0.065)",
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}