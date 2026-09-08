// components/account/QuickActions.tsx
import { t } from "@/theme";
import { ShoppingCart, Heart, Tag, MapPin, type LucideIcon } from "lucide-react";

const ACTIONS: { href: string; Icon: LucideIcon; label: string }[] = [
  { href: "/cart", Icon: ShoppingCart, label: "سلة التسوق" },
  { href: "/favorites", Icon: Heart, label: "المفضلة" },
  { href: "/offers", Icon: Tag, label: "قسائمي" },
  { href: "#addresses", Icon: MapPin, label: "عناويني" },
];

export default function QuickActions() {
  return (
    <div style={{ display: "flex", gap: t.spacing["3"], flexWrap: "wrap" }}>
      {ACTIONS.map((a) => (
        <a
          key={a.label}
          href={a.href}
          style={{
            display: "flex",
            alignItems: "center",
            gap: t.spacing["2"],
            padding: "10px 16px",
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.full,
            textDecoration: "none",
            fontSize: t.typography.fontSize.sm,
            color: t.colors.text.dark,
            fontWeight: t.typography.fontWeight.medium,
          }}
        >
          <a.Icon size={17} strokeWidth={1.7} />
          {a.label}
        </a>
      ))}
    </div>
  );
}
