// components/store/StoreAchievements.tsx
import { t } from "@/theme";
import { HeartHandshake, PackageCheck, Timer, Headset, ShoppingBag, type LucideIcon } from "lucide-react";
import { StoreDetail } from "./types";

export default function StoreAchievements({ store }: { store: StoreDetail }) {
  const info = store.publicInfo;
  const items: { Icon: LucideIcon; value: string | number; label: string }[] = [
    { Icon: HeartHandshake, value: info ? `${Math.round(info.satisfactionRate)}%` : "—", label: "رضا العملاء" },
    { Icon: PackageCheck, value: `${info?.completedOrders ?? store.totalOrders}+`, label: "طلبات مكتملة" },
    { Icon: Timer, value: info?.prepTimeDays ?? "—", label: "متوسط تجهيز الطلب" },
    { Icon: Headset, value: info?.responseSpeed ?? "—", label: "متوسط سرعة الرد" },
    { Icon: ShoppingBag, value: String(store.totalProducts), label: "عدد المنتجات" },
  ];

  return (
    <section
      style={{
        maxWidth: 1080,
        margin: `${t.spacing["6"]} auto 0`,
        padding: `${t.spacing["5"]} ${t.spacing["4"]}`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[900]})`,
          borderRadius: t.radius.xl,
          padding: `${t.spacing["6"]} ${t.spacing["4"]}`,
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: t.spacing["5"],
          textAlign: "center",
          direction: "rtl",
          boxShadow: t.shadows.md,
        }}
      >
        {items.map((it) => (
          <div key={it.label} style={{ minWidth: 120 }}>
            <it.Icon size={22} strokeWidth={1.8} color={t.colors.gold[400]} style={{ margin: "0 auto 6px" }} />
            <div style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[400] }}>{it.value}</div>
            <div style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.onDarkMuted, marginTop: 2 }}>{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}