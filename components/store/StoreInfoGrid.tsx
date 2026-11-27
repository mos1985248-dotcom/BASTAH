// components/store/StoreInfoGrid.tsx
import { Calendar, CreditCard, FileText, Package, RotateCcw, Truck, type LucideIcon } from "lucide-react";
import { yearsActiveFrom } from "@/lib/store-helpers";
import type { StoreDetail } from "./types";
import s from "./about.module.css";

export default function StoreInfoGrid({ store }: { store: StoreDetail }) {
  const info = store.publicInfo;
  const years = yearsActiveFrom(store.createdAt);
  const days = info?.returnPolicyDays;

  const items: { Icon: LucideIcon; label: string; value: string }[] = [
    { Icon: Calendar, label: "سنوات النشاط", value: years > 0 ? `${years} ${years === 1 ? "سنة" : "سنوات"}` : "متجر جديد" },
    { Icon: FileText, label: "رقم الترخيص", value: info?.licenseNumber || "غير مُدرَج" },
    { Icon: Truck, label: "شركة الشحن", value: info?.deliveryPartner || "غير محددة" },
    { Icon: CreditCard, label: "طرق الدفع", value: info?.paymentMethods?.length ? info.paymentMethods.join(" · ") : "غير محددة" },
    {
      Icon: RotateCcw,
      label: "سياسة الإرجاع",
      value: days !== undefined ? `${days} ${days === 1 ? "يوم" : "أيام"} من الاستلام` : "غير محددة",
    },
    { Icon: Package, label: "الاستلام الشخصي", value: store.pickupEnabled ? "متاح من موقع التاجر" : "غير متاح" },
  ];

  return (
    <section aria-label="بيانات المتجر" className={s.infoSection}>
      <dl className={s.info}>
        {items.map(({ Icon, label, value }) => (
          <div key={label} className={s.infoItem}>
            <dt className={s.infoLabel}>
              <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </dt>
            <dd className={s.infoValue}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
