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
      label: "متوسط تجهيز الطلب",
    },
    {
      Icon: Headset,
      value: info?.responseSpeed ?? "—",
      label: "متوسط سرعة الرد",
    },
    {
      Icon: ShoppingBag,
      value: String(store.totalProducts),
      label: "عدد المنتجات",
    },
  ];

  return (
    <section
      aria-label="إحصائيات المتجر"
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: `${t.spacing["8"]} auto 0`,
        padding: `0 ${t.spacing["5"]}`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[900]})`,
          borderRadius: t.radius.xl,
          padding: `${t.spacing["6"]} ${t.spacing["5"]}`,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: t.spacing["4"],
          direction: "rtl",
          textAlign: "center",
          boxShadow: t.shadows.md,
          overflow: "hidden",
        }}
      >
        {items.map(({ Icon, value, label }) => (
          <div
            key={label}
            style={{
              minWidth: 0,
              padding: `${t.spacing["2"]} ${t.spacing["3"]}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.lg,
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.07)",
              }}
            >
              <Icon
                size={20}
                strokeWidth={1.8}
                color={t.colors.gold[400]}
              />
            </span>

            <div
              style={{
                color: t.colors.gold[400],
                fontSize: t.typography.fontSize["2xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </div>

            <div
              style={{
                marginTop: 5,
                color: t.colors.text.onDarkMuted,
                fontSize: t.typography.fontSize.xs,
                lineHeight: 1.6,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 600px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            padding: 18px 12px !important;
          }
        }
      `}</style>
    </section>
  );
}