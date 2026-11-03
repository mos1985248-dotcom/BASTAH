// components/account/RecentOrdersList.tsx
import { AlertTriangle } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import s from "./account.module.css";

export interface BuyerOrder {
  id: string; orderNumber: string; status: string; total: number; createdAt: string;
  store: { nameAr: string; slug: string };
  items: { nameAr: string }[];
}

export default function RecentOrdersList({ orders, loading, error }: { orders: BuyerOrder[]; loading: boolean; error?: boolean }) {
  if (loading) return <p className={s.note} role="status">جاري التحميل...</p>;
  if (error) return (
    <p className={s.error} role="alert">
      <AlertTriangle size={16} strokeWidth={1.8} />
      تعذّر تحميل الطلبات، حاول تحديث الصفحة
    </p>
  );
  if (orders.length === 0) return <p className={s.note}>لا توجد طلبات بعد</p>;

  return (
    <ul className={s.rows}>
      {orders.map((o) => {
        const statusStyle = ORDER_STATUS_COLOR[o.status] ?? ORDER_STATUS_COLOR.PENDING;
        return (
          <li key={o.id}>
            <a href={`/orders/${o.id}`} className={s.orderRow}>
              <div className={s.rowBody}>
                <p className={s.rowTitle}>{o.store.nameAr}</p>
                <p className={s.rowMeta}>{o.orderNumber} · {o.items[0]?.nameAr}</p>
              </div>
              <div className={s.rowEnd}>
                <p className={s.total}>{o.total} ر.س</p>
                {/* لون الحالة من lib/order-status (المصدر الوحيد) */}
                <span className={s.badge} style={{ background: statusStyle.bg, color: statusStyle.color }}>
                  {ORDER_STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
