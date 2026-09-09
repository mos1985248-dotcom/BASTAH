// components/home/MuniraShowcase.tsx
import Image from "next/image";
import { BarChart3, ImageIcon, MessageCircle, PenLine, Tag, Sparkles, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

const CAPABILITIES: { Icon: LucideIcon; label: string }[] = [
  { Icon: BarChart3, label: "تحليل الأداء والمبيعات" },
  { Icon: ImageIcon, label: "تصميم صور احترافية" },
  { Icon: MessageCircle, label: "الرد على العملاء بذكاء" },
  { Icon: PenLine, label: "كتابة وصف المنتجات" },
  { Icon: Tag, label: "كتابة أسماء المنتجات" },
];

export default function MuniraShowcase() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]} 0` }}>
      <div
        style={{
          background: t.colors.primary[50],
          border: `1.5px solid ${t.colors.primary[100]}`,
          borderRadius: t.radius.xl,
          padding: t.spacing["6"],
          display: "flex",
          alignItems: "center",
          gap: t.spacing["5"],
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
        className="basita-munira-container"
      >
        {/* قسم تعريف منيرة وصورتها */}
        <div style={{ display: "flex", alignItems: "center", gap: t.spacing["4"], flex: "1 1 260px" }}>
          <Image 
            src="/images/munira-avatar.png" 
            alt="منيرة" 
            width={72} 
            height={72} 
            style={{ borderRadius: "50%", flexShrink: 0, border: `2px solid ${t.colors.primary[600]}` }}
          />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: t.spacing["2"], marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
                منيرة
              </h2>
              <span style={{ fontSize: 11, fontWeight: t.typography.fontWeight.bold, background: t.colors.gold[600], color: t.colors.white, padding: "2px 10px", borderRadius: t.radius.full }}>
                AI
              </span>
            </div>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
              مساعدتك الذكية لإدارة متجرك وزيادة مبيعاتك
            </p>
          </div>
        </div>

        {/* قسم القدرات والمميزات */}
        <div style={{ display: "flex", gap: t.spacing["3"], flexWrap: "wrap", flex: "2 1 420px", justifyContent: "center" }}>
          {CAPABILITIES.map((c) => (
            <div 
              key={c.label} 
              style={{ 
                textAlign: "center", 
                width: 95, 
                background: t.colors.white, 
                padding: `${t.spacing["3"]} ${t.spacing["2"]}`, 
                borderRadius: t.radius.md,
                border: `1px solid ${t.colors.primary[100]}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
              }}
            >
              <c.Icon size={22} strokeWidth={1.7} color={t.colors.primary[800]} style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: 11, color: t.colors.text.body, fontWeight: t.typography.fontWeight.medium, lineHeight: t.typography.lineHeight.snug }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* زر التفاعل "اسأل منيرة" */}
        <a
          href="/dashboard/munira"
          className="basita-btn-interactive"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 7, 
            padding: `12px ${t.spacing["6"]}`, 
            background: t.colors.primary[800], 
            color: t.colors.white, 
            borderRadius: t.radius.full, 
            fontWeight: t.typography.fontWeight.bold, 
            fontSize: t.typography.fontSize.sm, 
            textDecoration: "none", 
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <Sparkles size={16} strokeWidth={1.8} />
          اسأل منيرة
        </a>
      </div>
    </section>
  );
}
