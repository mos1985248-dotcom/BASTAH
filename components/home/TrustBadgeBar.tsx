// components/home/TrustBadgeBar.tsx
import { t } from "@/theme";
import { Truck, ShieldCheck, BadgeCheck, HeartHandshake, Undo2, type LucideIcon } from "lucide-react";

const BADGES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Truck, label: "شحن سريع" },
  { Icon: ShieldCheck, label: "دفع آمن" },
  { Icon: BadgeCheck, label: "منتجات سعودية" },
  { Icon: HeartHandshake, label: "دعم الأسر المنتجة" },
  { Icon: Undo2, label: "إرجاع سهل" },
];

export default function TrustBadgeBar() {
  return (
    <section aria-label="مزايا التسوّق في بسطة" style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["4"]} ${t.spacing["4"]} 0` }}>
      <ul
        style={{
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: `${t.spacing["4"]} ${t.spacing["2"]}`,
          margin: 0,
          listStyle: "none",
        }}
        className="basita-badge-row"
      >
        {BADGES.map((b, i) => (
          <li
            key={b.label}
            className="basita-badge-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: t.spacing["2"],
              padding: `0 ${t.spacing["3"]}`,
              borderInlineStart: i > 0 ? `1px solid ${t.colors.cream.borderLight}` : "none",
            }}
          >
            <b.Icon size={20} strokeWidth={1.7} color={t.colors.primary[800]} aria-hidden="true" />
            <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.dark, whiteSpace: "nowrap" }}>{b.label}</span>
          </li>
        ))}
      </ul>

      <style>{`
        @media (max-width: 760px) {
          .basita-badge-row { flex-wrap: wrap; gap: ${t.spacing["3"]}; justify-content: center !important; }
          .basita-badge-item { border-inline-start: none !important; }
        }
      `}</style>
    </section>
  );
}
