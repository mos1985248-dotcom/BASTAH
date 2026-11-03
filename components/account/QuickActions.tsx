// components/account/QuickActions.tsx
import { ShoppingCart, Heart, Tag, MapPin, type LucideIcon } from "lucide-react";
import s from "./account.module.css";

const ACTIONS: { href: string; Icon: LucideIcon; label: string }[] = [
  { href: "/cart", Icon: ShoppingCart, label: "سلة التسوق" },
  { href: "/favorites", Icon: Heart, label: "المفضلة" },
  { href: "/offers", Icon: Tag, label: "قسائمي" },
  { href: "#addresses", Icon: MapPin, label: "عناويني" },
];

export default function QuickActions() {
  return (
    <div className={s.quick}>
      {ACTIONS.map((a) => (
        <a key={a.label} href={a.href} className={s.pill}>
          <a.Icon size={18} strokeWidth={1.7} aria-hidden="true" />
          {a.label}
        </a>
      ))}
    </div>
  );
}
