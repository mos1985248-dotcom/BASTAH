// components/home/TrustBadgeBar.tsx
import { HeartHandshake, ShieldCheck, Truck, Undo2, type LucideIcon } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import s from "./trust.module.css";

const BADGES: { Icon: LucideIcon; label: string; detail?: string }[] = [
  { Icon: Truck, label: "شحن سريع" },
  { Icon: ShieldCheck, label: "دفع آمن" },
  { Icon: HeartHandshake, label: "دعم الأسر المنتجة", detail: "منتجات سعودية" },
  { Icon: Undo2, label: "إرجاع سهل" },
];

export default function TrustBadgeBar() {
  return (
    <section
      aria-label="مزايا التسوّق في بسطة مارت"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <ul className={s.strip} data-home-reveal-group>
        {BADGES.map(({ Icon, label, detail }) => (
          <li key={label} className={s.item} data-home-reveal>
            <span className={s.icon}>
              <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className={s.text}>
              <span className={s.label}>{label}</span>
              {detail && <span className={s.detail}>{detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
