
import Image from "next/image";
import { t } from "@/theme";
import styles from "./CompanyClosing.module.css";

export default function CompanyClosing() {
  return (
    <section
      style={{
        background: t.colors.white,
        padding: `${t.spacing["16"]} ${t.spacing["5"]} ${t.spacing["12"]}`,
        direction: "rtl",
      }}
    >
      <div
        className={styles.closingLayout}
        style={{
          borderRadius: t.radius.xl,
          background: t.colors.primary[950],
        }}
      >
        <div className={styles.closingImage}>
          <Image
            src="/images/about/company-closing.jpg"
            alt="مساحة عمل لمشروع محلي في بسطة"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{
              objectFit: "cover",
            }}
          />
        </div>

        <div className={styles.closingContent}>
          <p
            style={{
              margin: `0 0 ${t.spacing["3"]}`,
              color: t.colors.gold[400],
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            بسطة
          </p>

          <h2
            style={{
              margin: `0 0 ${t.spacing["5"]}`,
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize["3xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.5,
            }}
          >
            مساحة تبدأ من المنتج وتصل إلى العميل
          </h2>

          <p
            style={{
              maxWidth: 600,
              margin: `0 0 ${t.spacing["8"]}`,
              color: t.colors.text.onDarkMuted,
              fontSize: t.typography.fontSize.base,
              lineHeight: 2,
            }}
          >
            اكتشف المنتجات والمتاجر على بسطة، أو ابدأ حضورك الرقمي وأنشئ متجرك
            الخاص.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: t.spacing["3"],
              flexWrap: "wrap",
            }}
          >
            <a
              href="/marketplace"
              className="basita-btn-interactive"
              style={{
                minWidth: 150,
                padding: "12px 24px",
                background: t.colors.gold[600],
                color: t.colors.primary[950],
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              اكتشف المنتجات
            </a>

            <a
              href="/register"
              className="basita-btn-interactive"
              style={{
                minWidth: 150,
                padding: "12px 24px",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: t.colors.white,
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              ابدأ متجرك
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

