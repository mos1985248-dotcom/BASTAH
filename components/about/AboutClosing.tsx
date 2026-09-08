// components/about/AboutClosing.tsx
import { t } from "@/theme";

export default function AboutClosing() {
  return (
    <section style={{ background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`, padding: `${t.spacing["16"]} ${t.spacing["4"]}`, textAlign: "center", direction: "rtl" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.text.onDark }}>
          هذه هي بسطة
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"], fontSize: t.typography.fontSize.base, color: t.colors.text.onDarkMuted, lineHeight: t.typography.lineHeight.relaxed, marginBottom: t.spacing["8"] }}>
          <p>بسطة ليست مجرد مكان لبيع المنتجات.</p>
          <p>هي محاولة لبناء سوق رقمي يحتفظ بشيء من روح الأسواق القديمة.</p>
          <p>مكان تستطيع فيه الأسرة أن تعرض ما تصنعه.</p>
          <p>ويستطيع فيه العميل أن يكتشف منتجًا جديدًا.</p>
          <p>وتستطيع فيه قصة قديمة أن تجد جمهورًا جديدًا.</p>
          <p>نحن نؤمن أن دعم الأسرة المنتجة ليس مجرد شعار.</p>
          <p>إنه السبب الذي بدأنا من أجله.</p>
          <p>وأن المنتج الشعبي ليس مجرد سلعة.</p>
          <p style={{ color: t.colors.text.onDark, fontWeight: t.typography.fontWeight.bold, marginTop: t.spacing["2"] }}>
            إنه جزء من قصة، وذاكرة، وحرفة، وهوية تستحق أن تُرى.
          </p>
        </div>

        <div style={{ padding: `${t.spacing["6"]} 0`, borderTop: "1px solid rgba(255,255,255,0.15)", marginBottom: t.spacing["8"] }}>
          <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[400] }}>
            بسطة
          </p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.onDarkMuted }}>
            دعم الأسرة المنتجة.
          </p>
          <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: t.typography.fontSize.sm, color: t.colors.text.onDarkMuted, fontStyle: "italic" }}>
            نأخذ روح البسطة القديمة، ونمنحها مكانًا جديدًا في العالم الرقمي.
          </p>
        </div>

        <div style={{ display: "flex", gap: t.spacing["4"], justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/marketplace"
            className="basita-btn-interactive"
            style={{ padding: "12px 28px", background: t.colors.gold[600], color: t.colors.text.onDark, borderRadius: t.radius.full, fontWeight: t.typography.fontWeight.bold, textDecoration: "none", fontSize: t.typography.fontSize.sm }}
          >
            تسوّقي الآن
          </a>
          <a
            href="/register"
            className="basita-btn-interactive"
            style={{ padding: "12px 28px", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.35)", color: t.colors.white, borderRadius: t.radius.full, fontWeight: t.typography.fontWeight.bold, textDecoration: "none", fontSize: t.typography.fontSize.sm }}
          >
            ابدأ متجرك
          </a>
        </div>
      </div>
    </section>
  );
}