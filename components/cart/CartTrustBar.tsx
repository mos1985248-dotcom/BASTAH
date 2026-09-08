// components/cart/CartTrustBar.tsx
import { t } from "@/theme";
import { Lock, Truck, RotateCcw, BadgeCheck, type LucideIcon } from "lucide-react";

const ITEMS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Lock, label: "دفع آمن" },
  { Icon: Truck, label: "شحن سريع" },
  { Icon: RotateCcw, label: "إرجاع سهل" },
  { Icon: BadgeCheck, label: "منتجات موثوقة" },
];

export default function CartTrustBar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        flexWrap: "wrap",
        gap: t.spacing["3"],
        background: t.colors.cream.warm,
        borderRadius: t.radius.md,
        padding: `${t.spacing["3"]} ${t.spacing["2"]}`,
      }}
    >
      {ITEMS.map((it) => (
        <div key={it.label} style={{ textAlign: "center", flex: "1 1 80px" }}>
          <it.Icon size={19} strokeWidth={1.6} color={t.colors.primary[800]} style={{ margin: "0 auto" }} />
          <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.body, marginTop: 4 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}
