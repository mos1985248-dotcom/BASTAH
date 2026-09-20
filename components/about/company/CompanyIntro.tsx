
import Image from "next/image";
import { t } from "@/theme";

export default function CompanyIntro() {
  return (
    <section
      style={{
        background: t.colors.cream.bg,
        padding: `${t.spacing["12"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div
        className="company-intro-grid"
        style={{
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: t.spacing["10"],
          alignItems: "center",
        }}
      >
        {/* الصورة */}
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: 400,
            overflow: "hidden",
            borderRadius: t.radius.xl,
            background: t.colors.cream.warm,
          }}
        >
          <Image
            src="/images/about/company-intro.jpg"
            alt="منتجات محلية ومشاريع صغيرة"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{
              objectFit: "cover",
            }}
          />
        </div>

        {/* النص */}
        <div>
          <p
            style={{
              margin: `0 0 ${t.spacing["3"]}`,
              color: t.colors.gold[600],
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            عن بسطة
          </p>

          <h2
            style={{
              margin: `0 0 ${t.spacing["5"]}`,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize["3xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.5,
            }}
          >
            منصة صُممت لتسهّل حضور المشاريع المحلية في العالم الرقمي
          </h2>

          <p
            style={{
              margin: 0,
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.base,
              lineHeight: 2,
            }}
          >
            بسطة هي منصة تجارة رقمية تجمع بين أصحاب المتاجر والعملاء في تجربة
            واحدة. نوفّر للبائع مساحة لعرض منتجاته وإدارة نشاطه، ونمنح العميل
            طريقة أسهل لاكتشاف المنتجات والتسوق منها.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .company-intro-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

