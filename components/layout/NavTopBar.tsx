// components/layout/NavTopBar.tsx
import { Heart, Truck, Smartphone, type LucideIcon } from "lucide-react";
import s from "./nav.module.css";

// النص يبقى كما كان؛ على الجوال يظهر بند الشحن فقط لتجنّب التمرير الأفقي.
const ITEMS: { Icon: LucideIcon; label: string; optional?: boolean }[] = [
  { Icon: Heart, label: "دعم الأسر المنتجة", optional: true },
  { Icon: Truck, label: "الشحن لكل مناطق المملكة" },
  { Icon: Smartphone, label: "تطبيق بسطة مارت", optional: true },
];

export default function NavTopBar() {
  return (
    <div className={s.topbar}>
      <div className={s.topbarInner}>
        {ITEMS.map(({ Icon, label, optional }) => (
          <span key={label} className={`${s.topItem} ${optional ? s.topOptional : ""}`}>
            <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
