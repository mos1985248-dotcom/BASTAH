// components/cart/CartTrustBar.tsx
import { BadgeCheck, Lock, RotateCcw, Truck, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import c from "./cart.module.css";

const ITEMS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Lock, label: "دفع آمن" },
  { Icon: Truck, label: "شحن سريع" },
  { Icon: RotateCcw, label: "إرجاع سهل" },
  { Icon: BadgeCheck, label: "منتجات موثوقة" },
];

export default function CartTrustBar() {
  return (
    <ul className={c.trust} style={uiVars} aria-label="مزايا التسوق">
      {ITEMS.map(({ Icon, label }) => (
        <li key={label} className={c.trustItem}>
          <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
