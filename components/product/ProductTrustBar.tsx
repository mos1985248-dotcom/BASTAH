// components/product/ProductTrustBar.tsx
// شارات منصّة ثابتة (دفع آمن عبر Moyasar، دعم سريع...) — قدرات حقيقية
// للمنصّة نفسها وليست بيانات مُلفَّقة لكل منتج على حدة، بنفس مبدأ
// PLATFORM_BADGES بصفحة المتجر.
import { t } from "@/theme";
import { Headset, PackageCheck, RotateCcw, Lock, type LucideIcon } from "lucide-react";

const ITEMS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Headset, label: "دعم سريع" },
  { Icon: PackageCheck, label: "تغليف آمن" },
  { Icon: RotateCcw, label: "إرجاع سهل" },
  { Icon: Lock, label: "دفع آمن" },
];

export default function ProductTrustBar() {
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
        marginTop: t.spacing["4"],
      }}
    >
      {ITEMS.map((it) => (
        <div key={it.label} style={{ textAlign: "center", flex: "1 1 70px" }}>
          <it.Icon size={19} strokeWidth={1.6} color={t.colors.primary[800]} style={{ margin: "0 auto" }} />
          <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.body, marginTop: 4 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}
