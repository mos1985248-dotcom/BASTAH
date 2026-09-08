// components/home/StoryBlogCTARow.tsx
// ⚠️ روابط "قصتنا" و"المدونة" تشير لصفحات ضمن خارطة الطريق (لسه ما بُنيت).
import { ArrowLeft } from "lucide-react";
import { t } from "@/theme";

export default function StoryBlogCTARow({ showStartStore }: { showStartStore: boolean }) {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]} 0` }}>
      <div style={{ display: "grid", gridTemplateColumns: showStartStore ? "1fr 1fr 1.3fr" : "1fr 1fr", gap: t.spacing["4"] }} className="basita-story-row">
        
        {/* بطاقة قصتنا */}
        <a href="/about#story" style={{ textDecoration: "none", display: "block", height: "100%" }}>
          <div 
            className="basita-card-interactive" 
            style={{ 
              background: t.colors.white, 
              border: `1px solid ${t.colors.cream.border}`, 
              borderRadius: t.radius.lg, 
              padding: t.spacing["5"], 
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, color: t.colors.primary[800], fontWeight: t.typography.fontWeight.bold }}>قصتنا</h3>
              <p style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
                من فكرة بسيطة إلى منصة تدعم آلاف الأسر السعودية وتصنع أثراً حقيقياً
              </p>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
              اقرأ قصتنا
              <ArrowLeft size={15} strokeWidth={2.2} style={{ transform: "rotate(180deg)" }} />
            </span>
          </div>
        </a>

        {/* بطاقة المدونة */}
        <a href="/blog" style={{ textDecoration: "none", display: "block", height: "100%" }}>
          <div 
            className="basita-card-interactive" 
            style={{ 
              background: t.colors.white, 
              border: `1px solid ${t.colors.cream.border}`, 
              borderRadius: t.radius.lg, 
              padding: t.spacing["5"], 
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, color: t.colors.primary[800], fontWeight: t.typography.fontWeight.bold }}>المدونة</h3>
              <p style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
                تعرّف على قصص ملهمة ونصائح لرواد الأعمال وأخبار الأسر المنتجة
              </p>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
              تصفّح المدونة
              <ArrowLeft size={15} strokeWidth={2.2} style={{ transform: "rotate(180deg)" }} />
            </span>
          </div>
        </a>

        {/* بطاقة ابدأ متجرك (تظهر للشروحات أو الزوار فقط) */}
        {showStartStore && (
          <a href="/register" style={{ textDecoration: "none", display: "block", height: "100%" }}>
            <div 
              className="basita-card-interactive" 
              style={{ 
                background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`, 
                borderRadius: t.radius.lg, 
                padding: t.spacing["5"], 
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.onDark, fontWeight: t.typography.fontWeight.bold }}>ابدأ متجرك مجاناً</h3>
                <p style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.onDarkMuted, lineHeight: t.typography.lineHeight.relaxed }}>
                  انضم إلى آلاف الأسر المنتجة وابدأ رحلتك في بسطة الآن
                </p>
              </div>
              <div>
                <span className="basita-btn-interactive" style={{ display: "inline-block", padding: "8px 18px", background: t.colors.gold[600], color: t.colors.white, borderRadius: t.radius.full, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}>
                  ابدأ مجاناً
                </span>
              </div>
            </div>
          </a>
        )}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .basita-story-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}