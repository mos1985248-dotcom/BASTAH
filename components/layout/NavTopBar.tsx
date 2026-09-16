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
        fontSize: t.typography.fontSize.xs,
        direction: "rtl",
      }}
    >
      <div
        className="basita-topbar-inner"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          minHeight: 34,
          padding: `0 ${t.spacing["4"]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: t.spacing["6"],
          flexWrap: "wrap",
          boxSizing: "border-box",
        }}
      >
        {ITEMS.map((item) => (
          <span
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              whiteSpace: "nowrap",
              opacity: 0.95,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <item.Icon
                size={14}
                strokeWidth={1.8}
                color={t.colors.gold[400]}
              />
            </span>

            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}