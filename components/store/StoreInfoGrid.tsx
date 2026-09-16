// components/store/StoreInfoGrid.tsx

import { t } from "@/theme";
import {
  Calendar,
  FileBadge,
  Truck,
  CreditCard,
  Clock,
  RotateCcw,
  MapPin,
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
      Icon: Clock,
      label: "ساعات العمل",
      value: info?.workingHours || "غير محددة",
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
      aria-label="معلومات المتجر"
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: `${t.spacing["8"]} auto 0`,
        padding: `0 ${t.spacing["5"]}`,
        boxSizing: "border-box",
        direction: "rtl",
      }}
    >
      <div
        style={{
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.xl,
          padding: t.spacing["6"],
          boxShadow: t.shadows.sm,
        }}
      >
        {/* العنوان */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: t.spacing["5"],
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: t.colors.text.dark,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              معلومات المتجر
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                color: t.colors.text.light,
                fontSize: t.typography.fontSize.xs,
              }}
            >
              تفاصيل تساعدك على معرفة المتجر قبل الطلب
            </p>
          </div>
        </div>

        {/* المعلومات */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
          }}
        >
          {items.map(({ Icon, label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                minWidth: 0,
                padding: "14px 15px",
                background: t.colors.cream.bg,
                border: `1px solid ${t.colors.cream.borderLight}`,
                borderRadius: t.radius.lg,
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.md,
                  background: t.colors.primary[100],
                  color: t.colors.primary[800],
                }}
              >
                <Icon size={18} strokeWidth={1.7} />
              </span>

              <div
                style={{
                  minWidth: 0,
                  paddingTop: 1,
                }}
              >
                <div
                  style={{
                    color: t.colors.text.light,
                    fontSize: t.typography.fontSize.xs,
                    lineHeight: 1.6,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color: t.colors.text.dark,
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    lineHeight: 1.7,
                    wordBreak: "break-word",
                  }}
                >
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}