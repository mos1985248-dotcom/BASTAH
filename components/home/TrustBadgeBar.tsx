// components/home/TrustBadgeBar.tsx
import { BadgeCheck, HeartHandshake, ShieldCheck, Truck, Undo2, type LucideIcon } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import s from "./trust.module.css";

const BADGES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Truck, label: "شحن سريع" },
  { Icon: ShieldCheck, label: "دفع آمن" },
  { Icon: BadgeCheck, label: "منتجات سعودية" },
  { Icon: HeartHandshake, label: "دعم الأسر المنتجة" },
  { Icon: Undo2, label: "إرجاع سهل" },
];

export default function TrustBadgeBar() {
  return (
    <section
      aria-label="مزايا التسوّق في بسطة"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <ul className={s.strip}>
        {BADGES.map(({ Icon, label }) => (
          <li key={label} className={s.item}>
            <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
