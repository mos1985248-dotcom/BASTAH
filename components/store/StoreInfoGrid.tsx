// components/store/StoreInfoGrid.tsx

import { t } from "@/theme";
import {
  Calendar,
  FileBadge,
  Truck,
  CreditCard,
  MapPin,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { yearsActiveFrom } from "@/lib/store-helpers";
import { StoreDetail } from "./types";

export default function StoreInfoGrid({
  store,
}: {
  store: StoreDetail;
}) {
  const info = store.publicInfo;
  const yearsActive = yearsActiveFrom(store.createdAt);

  const items: {
    Icon: LucideIcon;
    label: string;
    value: string;
  }[] = [
    {
      Icon: Calendar,
      label: "سنوات النشاط",
      value:
        yearsActive > 0
          ? `+${yearsActive} ${
              yearsActive === 1 ? "سنة" : "سنوات"
            }`
          : "متجر جديد",
    },
    {
      Icon: FileBadge,
      label: "رقم الترخيص",
      value: info?.licenseNumber || "غير مُدرَج",
    },
    {
      Icon: Truck,
      label: "شركة الشحن",
      value: info?.deliveryPartner || "غير محددة",
    },
    {
      Icon: CreditCard,
      label: "طرق الدفع",
      value: info?.paymentMethods?.length
        ? info.paymentMethods.join(" · ")
        : "غير محددة",
    },
    {
      Icon: MapPin,
      label: "المدينة",
      value: store.city || "غير محددة",
    },
    {
      Icon: RotateCcw,
      label: "سياسة الإرجاع",
      value: info
        ? `${info.returnPolicyDays} ${
            info.returnPolicyDays === 1 ? "يوم" : "أيام"
          } من الاستلام`
        : "—",
    },
    {
      Icon: MapPin,
      label: "الاستلام الشخصي",
      value: store.pickupEnabled
        ? "متاح من موقع التاجر"
        : "غير متاح",
    },
  ];

  return (
    <section
      aria-label="بيانات المتجر"
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
          display: "grid",
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          width: "100%",
          minHeight: 60,
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          boxShadow: t.shadows.xs,
          overflow: "hidden",
        }}
      >
        {items.map(({ Icon, label, value }, index) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
              padding: "8px 10px",
              background:
                index % 2 === 0
                  ? t.colors.white
                  : t.colors.cream.bg,
              borderLeft:
                index !== items.length - 1
                  ? `1px solid ${t.colors.cream.borderLight}`
                  : undefined,
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.sm,
                background: t.colors.primary[50],
                color: t.colors.primary[700],
              }}
            >
              <Icon size={15} strokeWidth={1.7} />
            </span>

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  color: t.colors.text.light,
                  fontSize: "10px",
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </div>

              <div
                title={value}
                style={{
                  marginTop: 2,
                  color: t.colors.text.dark,
                  fontSize: "12px",
                  fontWeight: t.typography.fontWeight.semibold,
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}