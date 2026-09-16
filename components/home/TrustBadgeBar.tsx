// components/home/TrustBadgeBar.tsx
import { t } from "@/theme";
import {
  Truck,
  ShieldCheck,
  BadgeCheck,
  HeartHandshake,
  Undo2,
  type LucideIcon,
} from "lucide-react";

const BADGES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Truck, label: "شحن سريع" },
  { Icon: ShieldCheck, label: "دفع آمن" },
  { Icon: BadgeCheck, label: "منتجات سعودية" },
  { Icon: HeartHandshake, label: "دعم الأسر المنتجة" },
  { Icon: Undo2, label: "إرجاع سهل" },
];

export default function TrustBadgeBar() {
  return (
<<<<<<< HEAD
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
=======
    <section
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["4"]} ${t.spacing["4"]} 0`,
        direction: "rtl",
      }}
    >
      <div
>>>>>>> 239c0d7 (Improve Basita UI and dashboard)
        className="basita-badge-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
          padding: 8,
          borderRadius: 20,
          background: "#F7F1E5",
          border: "1px solid rgba(91,70,45,0.11)",
          boxShadow: "0 4px 14px rgba(67,48,29,0.035)",
        }}
      >
<<<<<<< HEAD
        {BADGES.map((b, i) => (
          <li
=======
        {BADGES.map((b) => (
          <div
>>>>>>> 239c0d7 (Improve Basita UI and dashboard)
            key={b.label}
            className="basita-badge-item"
            style={{
              minHeight: 68,
              padding: "8px 10px",
              borderRadius: 14,
              background: "#FFFDF8",
              border: "1px solid rgba(91,70,45,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxSizing: "border-box",
              transition:
                `transform ${t.motion.base} ${t.motion.ease}, ` +
                `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
                `border-color ${t.motion.base} ${t.motion.ease}`,
            }}
          >
<<<<<<< HEAD
            <b.Icon size={20} strokeWidth={1.7} color={t.colors.primary[800]} aria-hidden="true" />
            <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.dark, whiteSpace: "nowrap" }}>{b.label}</span>
          </li>
=======
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                background: t.colors.gold[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <b.Icon
                size={18}
                strokeWidth={1.8}
                color={t.colors.gold[700]}
              />
            </span>

            <span
              style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.text.dark,
                whiteSpace: "nowrap",
              }}
            >
              {b.label}
            </span>
          </div>
>>>>>>> 239c0d7 (Improve Basita UI and dashboard)
        ))}
      </ul>

      <style>{`
        .basita-badge-item:hover {
          transform: translateY(-2px);
          border-color: rgba(166,124,45,0.20) !important;
          box-shadow: 0 7px 16px rgba(67,48,29,0.06);
        }

        @media (max-width: 900px) {
          .basita-badge-row {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 600px) {
          .basita-badge-row {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .basita-badge-item {
            min-height: 62px !important;
          }

          .basita-badge-item span:last-child {
            white-space: normal !important;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}