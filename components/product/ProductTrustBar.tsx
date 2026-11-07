// components/product/ProductTrustBar.tsx
// شارات المنصة الثابتة (قدرات حقيقية للمنصة نفسها وليست بيانات لكل منتج).
import { Headset, Lock, PackageCheck, RotateCcw, type LucideIcon } from "lucide-react";
import s from "./buy.module.css";

const ITEMS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Headset, label: "دعم سريع" },
  { Icon: PackageCheck, label: "تغليف آمن" },
  { Icon: RotateCcw, label: "إرجاع سهل" },
  { Icon: Lock, label: "دفع آمن" },
];

export default function ProductTrustBar() {
  return (
    <ul className={s.trust} aria-label="مزايا التسوق في بسطة مارت">
      {ITEMS.map(({ Icon, label }) => (
        <li key={label} className={s.trustItem}>
          <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
