// components/pricing/NoCommissionBanner.tsx
import { HandCoins, Truck, RotateCcw, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

const POINTS: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: HandCoins, title: "بدون عمولة إطلاقاً", desc: "كل ريال تبيعينه لك بالكامل — مهما زادت مبيعاتك" },
  { Icon: Truck, title: "3 ريال شحن فقط", desc: "رسوم شحن ثابتة وواضحة، بدون تكاليف خفية" },
  { Icon: RotateCcw, title: "رقّي أو نزّلي باقتك وقتها", desc: "بدون التزام سنوي، غيّري باقتك من لوحة تحكمك بأي وقت" },
];

export default function NoCommissionBanner() {
  return (
    <section style={{ background: t.colors.primary[900], padding: `${t.spacing["4"]} ${t.spacing["4"]}`, direction: "rtl" }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: t.spacing["6"],
          alignItems: "center",
        }}
      >
        {POINTS.map((p) => (
          <div key={p.title} style={{ display: "flex", alignItems: "center", gap: t.spacing["3"] }}>
            <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: t.radius.full, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(255,255,255,0.08)` }}>
              <p.Icon size={20} strokeWidth={1.8} color={t.colors.gold[400]} />
            </div>
            <div>
              <h3 style={{ margin: `0 0 2px`, color: t.colors.gold[400], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}>
                {p.title}
              </h3>
              <p style={{ margin: 0, color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.xs, lineHeight: t.typography.lineHeight.normal }}>
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}