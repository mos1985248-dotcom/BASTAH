// components/home/WhyBasita.tsx
import { t } from "@/theme";
import { Megaphone, HandHeart, Wrench, Users, Headset } from "lucide-react";

const FEATURES = [
  { Icon: Megaphone, title: "تسويق ودعم", desc: "لمتجرك ومنتجاتك" },
  { Icon: HandHeart, title: "بدون عمولات", desc: "على الباقات المجانية" },
  { Icon: Wrench, title: "أدوات متكاملة", desc: "لإدارة متجرك بسهولة" },
  { Icon: Users, title: "وصول أكبر", desc: "لآلاف العملاء يومياً" },
  { Icon: Headset, title: "دعم فني سريع", desc: "فريق يرافقك خطوة بخطوة" },
];

export default function WhyBasita() {
  return (
    <section aria-labelledby="why-heading" style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["16"]} ${t.spacing["4"]} ${t.spacing["12"]}` }}>
      <h2 id="why-heading" style={{ textAlign: "center", fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: `0 0 ${t.spacing["8"]}` }}>
        ليش بسطة؟
      </h2>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: t.spacing["8"] }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ textAlign: "center", maxWidth: 160, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div 
              style={{ 
                width: 52, 
                height: 52, 
                borderRadius: t.radius.full, 
                background: t.colors.cream.warm, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: t.spacing["3"],
                border: `1px solid ${t.colors.cream.border}`
              }}
            >
              <f.Icon size={24} strokeWidth={1.8} color={t.colors.primary[800]} aria-hidden="true" />
            </div>
            <p style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{f.title}</p>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
