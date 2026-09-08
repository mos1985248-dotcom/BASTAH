// components/layout/NavTopBar.tsx
import { Heart, Truck, Smartphone, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

const ITEMS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Heart, label: "دعم الأسر المنتجة" },
  { Icon: Truck, label: "الشحن لكل مناطق المملكة" },
  { Icon: Smartphone, label: "تطبيق بسطة" },
];

export default function NavTopBar() {
  return (
    <div
      style={{
        background: t.colors.primary[950],
        color: t.colors.text.onDarkMuted,
        fontSize: t.typography.fontSize.sm,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: `${t.spacing["2"]} ${t.spacing["4"]}`,
          display: "flex",
          justifyContent: "center",
          gap: t.spacing["10"],
          flexWrap: "wrap",
        }}
      >
        {ITEMS.map((item) => (
          <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <item.Icon size={15} strokeWidth={1.8} color={t.colors.gold[400]} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}