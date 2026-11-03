// components/account/OrderStatusSummary.tsx
import { PackageCheck, Truck, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import s from "./account.module.css";

const STATUS_META: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "PROCESSING", label: "قيد التجهيز", Icon: PackageCheck },
  { key: "SHIPPED", label: "في الطريق", Icon: Truck },
  { key: "DELIVERED", label: "تم التوصيل", Icon: CheckCircle2 },
  { key: "CANCELLED", label: "ملغي", Icon: XCircle },
];

export default function OrderStatusSummary({ orders }: { orders: { status: string }[] }) {
  return (
    <div className={s.stats}>
      {STATUS_META.map((m) => {
        const count = orders.filter((o) => o.status === m.key).length;
        return (
          <div key={m.key} className={s.stat}>
            <m.Icon size={22} strokeWidth={1.6} aria-hidden="true" />
            <div className={s.statVal}>{count}</div>
            <div className={s.statLbl}>{m.label}</div>
          </div>
        );
      })}
    </div>
  );
}
