// components/auth/AuthShell.tsx
// القالب المشترك لصفحات المصادقة (Login/Register/Reset).
// لوحة هوية خضراء + بطاقة نموذج بيضاء. كل القيم من theme/ فقط.
// ⚠️ لا أرقام/إحصاءات هنا عمداً — لا بيانات وهمية على أي صفحة تواجه
// المستخدم، خصوصاً أول صفحة يراها قبل التسجيل.
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
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row-reverse",
        background: t.colors.cream.bg,
      }}
    >
      {/* لوحة الهوية — تختفي على الشاشات الصغيرة وتصبح شريط علوي */}
      <aside
        className="basita-auth-brand"
        style={{
          flex: "1 1 46%",
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${t.colors.primary[900]} 0%, ${t.colors.primary[800]} 55%, ${t.colors.primary[700]} 100%)`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: t.spacing["10"],
        }}
      >
        {/* زخرفة هندسية دلالتها التراث السعودي — لا تحمل نصاً وظيفياً */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              `radial-gradient(${t.colors.gold[400]} 2px, transparent 2px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: t.spacing["3"] }}>
          <Image src="/images/logo-icon.png" alt="بسطة" width={44} height={44} />
          <span
            style={{
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            بسطة
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <h2
            style={{
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize["3xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: t.typography.lineHeight.snug,
              margin: `0 0 ${t.spacing["3"]}`,
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
              maxWidth: 380,
            }}
          >
            منصة بسطة تجمع أفضل المنتجات من الأسر السعودية المنتجة بجودة وشغف وحب.
          </p>
        </div>

        <div style={{ position: "relative", display: "flex", gap: t.spacing["3"], flexWrap: "wrap" }}>
          {["دعم الأسرة المنتجة", "منتجات شعبية أصيلة", "بدون عمولة على المبيعات"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: t.typography.fontSize.xs, color: t.colors.text.onDarkMuted,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: t.radius.full, background: t.colors.gold[400], flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </aside>

      {/* بطاقة النموذج */}
      <main
        style={{
          flex: "1 1 54%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: t.spacing["6"],
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div
            className="basita-auth-mobile-logo"
            style={{ display: "none", justifyContent: "center", marginBottom: t.spacing["6"] }}
          >
            <Image src="/images/logo-icon.png" alt="بسطة" width={48} height={48} />
          </div>

          {title && (
            <h1
              style={{
                margin: 0,
                fontSize: t.typography.fontSize["2xl"],
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
                textAlign: "center",
              }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              style={{
                margin: `${t.spacing["2"]} 0 ${t.spacing["8"]}`,
                fontSize: t.typography.fontSize.base,
                color: t.colors.text.mid,
                textAlign: "center",
              }}
            >
              {subtitle}
            </p>
          )}

          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 860px) {
          .basita-auth-brand { display: none; }
          .basita-auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
