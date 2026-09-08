// components/home/HeroSection.tsx
// ⚠️ منطقة الصورة "backgroundImage" حالياً نمط زخرفي بديل (placeholder) —
// استبدليها بصورة حقيقية لأسرة منتجة عند توفرها (نفس مكان التعليق بالأسفل).
import { Landmark, ArrowLeft } from "lucide-react";
import { t } from "@/theme";

export default function HeroSection({ showStartStore }: { showStartStore: boolean }) {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["6"]} ${t.spacing["4"]} 0` }}>
      <div
        style={{
          borderRadius: t.radius.xl,
          overflow: "hidden",
          background: t.colors.cream.warm,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "stretch",
          position: "relative",
        }}
        className="basita-hero-grid"
      >
        {/* قسم النصوص والأزرار التفاعلية (أصبح على اليمين) */}
        <div 
          style={{ 
            padding: t.spacing["8"], 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center" 
          }}
          className="basita-hero-content"
        >
          <h1 style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[900], lineHeight: t.typography.lineHeight.snug }}>
            ادعم الأسر المنتجة
            <br />
            واكتشف منتجات سعودية أصلية
          </h1>
          
          <p style={{ margin: `0 0 ${t.spacing["6"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
            منصة بسطة تجمع أفضل المنتجات من الأسر السعودية المنتجة بجودة وشغف وحب.
          </p>

          <div style={{ display: "flex", gap: t.spacing["3"], flexWrap: "wrap", alignItems: "center" }}>
            <a href="/marketplace" className="basita-btn-interactive" style={{ padding: `12px ${t.spacing["6"]}`, background: t.colors.primary[800], color: t.colors.text.onDark, borderRadius: t.radius.md, fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}>
              تسوّق الآن
            </a>
            
            <a href="/marketplace" className="basita-btn-interactive" style={{ padding: `12px ${t.spacing["6"]}`, background: t.colors.white, border: `1.5px solid ${t.colors.cream.border}`, color: t.colors.primary[800], borderRadius: t.radius.md, fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}>
              تصفح المتاجر
            </a>
            
            {showStartStore && (
              <a href="/register" className="basita-btn-interactive" style={{ display: "flex", alignItems: "center", gap: 6, padding: `12px ${t.spacing["4"]}`, background: "transparent", color: t.colors.gold[700], fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}>
                ابدأ متجرك مجاناً
                <ArrowLeft size={16} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
              </a>
            )}
          </div>
        </div>

        {/* قسم الصورة / الخلفية البصرية (أصبح على اليسار) */}
        <div
          style={{
            position: "relative",
            minHeight: 340,
            // 📸 ضعي هنا صورة حقيقية: background: `url(/images/hero-family.jpg) center/cover`
            background: `linear-gradient(135deg, ${t.colors.primary[700]}, ${t.colors.gold[700]})`,
          }}
        >
          {/* شارة صنع في السعودية */}
          <span
            style={{
              position: "absolute",
              top: t.spacing["5"],
              insetInlineStart: t.spacing["5"],
              background: t.colors.primary[900],
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              padding: `${t.spacing["2"]} ${t.spacing["3"]}`,
              borderRadius: t.radius.md,
              textAlign: "center",
              lineHeight: t.typography.lineHeight.tight,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            صنع في
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Landmark size={13} strokeWidth={1.8} />
              السعودية
            </span>
          </span>

          {/* مؤشرات شرائح الـ Hero (Dots) */}
          <div style={{ position: "absolute", bottom: t.spacing["5"], left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: i === 0 ? 22 : 6, height: 6, borderRadius: t.radius.full, background: i === 0 ? t.colors.white : "rgba(255,255,255,0.5)", transition: "width 0.3s ease" }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .basita-hero-grid { grid-template-columns: 1fr !important; }
          .basita-hero-content { padding: ${t.spacing["6"]} ${t.spacing["4"]} !important; text-align: center; align-items: center; }
          .basita-hero-content div { justify-content: center; }
        }
      `}</style>
    </section>
  );
}