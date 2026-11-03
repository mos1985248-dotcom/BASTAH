// components/dashboard/RecentOrderRow.tsx
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/order-status";
import s from "./home.module.css";

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  buyer: { name: string };
  items: { nameAr: string }[];
}

export default function RecentOrderRow({ order }: { order: DashboardOrder }) {
  const color = ORDER_STATUS_COLOR[order.status] ?? ORDER_STATUS_COLOR.PENDING;
  const firstItem = order.items[0]?.nameAr ?? "منتج";
  return (
    <a href={`/dashboard/orders/${order.id}`} className={s.orderRow}>
      <span className={s.orderMain}>
        <span className={s.orderNo}>{order.orderNumber}</span>
        <span className={s.orderSub}>{order.buyer.name} · {firstItem}</span>
      </span>
      <span className={s.orderEnd}>
        <span className={s.orderTotal}>{order.total} ر.س</span>
        <span className={s.chip} style={{ color: color.color, background: color.bg }}>
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
      </span>
    </a>
  );
}
