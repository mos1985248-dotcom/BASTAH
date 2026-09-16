// components/about/AboutIntro.tsx

import { t } from "@/theme";

export default function AboutIntro() {
  return (
    <section
      id="story"
      style={{
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
        padding: `${t.spacing["16"]} ${t.spacing["5"]} ${t.spacing["8"]}`,
        boxSizing: "border-box",
        textAlign: "center",
        direction: "rtl",
      }}
    >
      <p
        style={{
          margin: `0 0 ${t.spacing["6"]}`,
          color: t.colors.primary[800],
          fontSize: t.typography.fontSize["2xl"],
          fontWeight: t.typography.fontWeight.bold,
          lineHeight: 1.5,
        }}
      >
        في كل بيت حكاية.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["4"],
          color: t.colors.text.body,
          fontSize: t.typography.fontSize.base,
          lineHeight: 2,
        }}
      >
        <p style={{ margin: 0 }}>
          وفي كل أسرة منتجة شيء صنعته الأيدي قبل أن تصله الأسواق؛ وصفة
          تتوارثها الأمهات، حرفة تعلمتها العائلة، قطعة تحمل ملامح المكان،
          أو منتج شعبي يرتبط بذكرى قديمة لا تُنسى.
        </p>

        <p style={{ margin: 0 }}>
          لكن كثيرًا من هذه الأشياء بقيت قريبة من الناس وبعيدة عن السوق
          الرقمي.
        </p>

        <p
          style={{
            margin: `${t.spacing["2"]} 0 0`,
            padding: `${t.spacing["3"]} ${t.spacing["5"]}`,
            color: t.colors.primary[800],
            background: t.colors.primary[50],
            borderRadius: t.radius.lg,
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.7,
          }}
        >
          من هنا بدأت بسطة.
        </p>

        <p style={{ margin: 0 }}>
          لم نرد أن نبني متجرًا إلكترونيًا آخر يضع صورة المنتج وسعره وزر
          &quot;اشترِ الآن&quot; وينتهي الأمر.
        </p>

        <p
          style={{
            margin: `${t.spacing["2"]} 0 0`,
            color: t.colors.text.dark,
            fontWeight: t.typography.fontWeight.semibold,
          }}
        >
          أردنا أن نبني مكانًا يشعر فيه الناس أن وراء كل منتج إنسانًا وقصة
          وذاكرة.
        </p>
      </div>
    </section>
  );
}