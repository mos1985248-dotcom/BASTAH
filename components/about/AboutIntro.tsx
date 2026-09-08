// components/about/AboutIntro.tsx
import { t } from "@/theme";

export default function AboutIntro() {
  return (
    <section id="story" style={{ maxWidth: 740, margin: "0 auto", padding: `${t.spacing["16"]} ${t.spacing["4"]} ${t.spacing["8"]}`, textAlign: "center", direction: "rtl" }}>
      <p style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
        في كل بيت حكاية.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"], fontSize: t.typography.fontSize.base, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
        <p style={{ margin: 0 }}>
          وفي كل أسرة منتجة شيء صنعته الأيدي قبل أن تصله الأسواق؛ وصفة تتوارثها الأمهات، حرفة تعلمتها العائلة،
          قطعة تحمل ملامح المكان، أو منتج شعبي يرتبط بذكرى قديمة لا تُنسى.
        </p>
        <p style={{ margin: 0 }}>لكن كثيرًا من هذه الأشياء بقيت قريبة من الناس وبعيدة عن السوق الرقمي.</p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], fontSize: t.typography.fontSize.lg }}>من هنا بدأت بسطة.</p>
        <p style={{ margin: 0 }}>
          لم نرد أن نبني متجرًا إلكترونيًا آخر يضع صورة المنتج وسعره وزر &quot;اشترِ الآن&quot; وينتهي الأمر.
        </p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.medium }}>أردنا أن نبني مكانًا يشعر فيه الناس أن وراء كل منتج إنسانًا وقصة وذاكرة.</p>
      </div>
    </section>
  );
}