// components/store/StoreAchievements.tsx

import {
  HeartHandshake,
  PackageCheck,
  Timer,
  Headset,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";
import { StoreDetail } from "./types";

export default function StoreAchievements({
  store,
}: {
  store: StoreDetail;
}) {
  const info = store.publicInfo;

  const items: {
    Icon: LucideIcon;
    value: string | number;
    label: string;
  }[] = [
    {
      Icon: HeartHandshake,
      value: info ? `${Math.round(info.satisfactionRate)}%` : "—",
      label: "رضا العملاء",
    },
    {
      Icon: PackageCheck,
      value: `${info?.completedOrders ?? store.totalOrders}+`,
      label: "طلبات مكتملة",
    },
    {
      Icon: Timer,
      value: info?.prepTimeDays ?? "—",
      label: "متوسط التجهيز",
    },
    {
      Icon: Headset,
      value: info?.responseSpeed ?? "—",
      label: "سرعة الرد",
    },
    {
      Icon: ShoppingBag,
      value: String(store.totalProducts),
      label: "المنتجات",
    },
  ];

  return (
    <section
      aria-label="إحصائيات المتجر"
      style={{
        width: "100%",
        maxWidth: 1180,
        margin: `${t.spacing["3"]} auto 0`,
        padding: `0 ${t.spacing["4"]}`,
        boxSizing: "border-box",
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "8px 6px",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          background: `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[900]})`,
          borderRadius: t.radius.lg,
          boxShadow: t.shadows.xs,
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {items.map(({ Icon, value, label }, index) => (
          <div
            key={label}
            style={{
              minWidth: 0,
              height: 52,
              padding: "2px 6px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              borderLeft:
                index !== items.length - 1
                  ? "1px solid rgba(255,255,255,0.08)"
                  : undefined,
            }}
          >
            <span
              style={{
                width: 25,
                height: 25,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.07)",
              }}
            >
              <Icon
                size={13}
                strokeWidth={1.8}
                color={t.colors.gold[400]}
              />
            </span>

            <div
              style={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  color: t.colors.gold[400],
                  fontSize: "16px",
                  fontWeight: t.typography.fontWeight.bold,
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </div>

              <div
                style={{
                  marginTop: 2,
                  maxWidth: "100%",
                  color: t.colors.text.onDarkMuted,
                  fontSize: "9px",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}