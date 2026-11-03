// components/dashboard/RecentOrdersCard.tsx
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import RecentOrderRow, { DashboardOrder } from "./RecentOrderRow";
import s from "./home.module.css";

export default function RecentOrdersCard({ orders }: { orders: DashboardOrder[] }) {
  return (
    <section className={s.card} style={uiVars} aria-labelledby="recent-orders-title">
      <div className={s.cardHead}>
        <div>
          <h2 id="recent-orders-title" className={s.cardTitle}>أحدث الطلبات</h2>
          <p className={s.cardSub}>متابعة آخر الطلبات في متجرك</p>
        </div>
        <a href="/dashboard/orders" className={s.more}>
          عرض الكل
          <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>
      {orders.length === 0 ? (
        <div className={s.empty}>
          <ShoppingBag size={30} strokeWidth={1.5} aria-hidden="true" />
          <p className={s.emptyTitle}>لا توجد طلبات بعد</p>
          <p className={s.emptyText}>ستظهر الطلبات الجديدة هنا</p>
        </div>
      ) : (
        <ul className={s.orders}>
          {orders.map((order) => (
            <li key={order.id}><RecentOrderRow order={order} /></li>
          ))}
        </ul>
      )}
    </section>
  );
}
