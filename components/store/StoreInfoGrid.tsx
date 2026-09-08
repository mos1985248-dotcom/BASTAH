// components/store/StoreInfoGrid.tsx
import { t } from "@/theme";
import { Calendar, FileBadge, Truck, CreditCard, Clock, RotateCcw, MapPin, type LucideIcon } from "lucide-react";
import { yearsActiveFrom } from "@/lib/store-helpers";
import { StoreDetail } from "./types";

export default function StoreInfoGrid({ store }: { store: StoreDetail }) {
  const info = store.publicInfo;
  const yearsActive = yearsActiveFrom(store.createdAt);

  const items: { Icon: LucideIcon; label: string; value: string }[] = [
    { Icon: Calendar, label: "سنوات النشاط", value: yearsActive > 0 ? `+${yearsActive} ${yearsActive === 1 ? "سنة" : "سنوات"}` : "متجر جديد" },
    { Icon: FileBadge, label: "رقم الترخيص", value: info?.licenseNumber || "غير مُدرَج" },
    { Icon: Truck, label: "شركة الشحن", value: info?.deliveryPartner || "غير محددة" },
    { Icon: CreditCard, label: "طرق الدفع", value: info?.paymentMethods?.length ? info.paymentMethods.join(" · ") : "غير محددة" },
    { Icon: Clock, label: "ساعات العمل", value: info?.workingHours || "غير محددة" },
    { Icon: RotateCcw, label: "سياسة الإرجاع", value: info ? `${info.returnPolicyDays} ${info.returnPolicyDays === 1 ? "يوم" : "أيام"} من الاستلام` : "—" },
    { Icon: MapPin, label: "الاستلام الشخصي", value: store.pickupEnabled ? "متاح من موقع التاجر" : "غير متاح" },
  ];

  return (
    <section
      style={{
        maxWidth: 1080,
        margin: `${t.spacing["6"]} auto 0`,
        padding: `0 ${t.spacing["4"]}`,
        direction: "rtl",
      }}
    >
      <div style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["6"] }}>
        <h3 style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          معلومات المتجر
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: t.spacing["5"] }}>
          {items.map((it) => (
            <div key={it.label} style={{ textAlign: "center", padding: t.spacing["3"], background: t.colors.cream?.light || "#faf8f5", borderRadius: t.radius.md }}>
              <it.Icon size={22} strokeWidth={1.6} color={t.colors.primary[800]} style={{ margin: `0 auto ${t.spacing["2"]}` }} />
              <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{it.label}</div>
              <div style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.dark, marginTop: 4 }}>{it.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}