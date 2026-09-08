// components/dashboard/RecentOrderRow.tsx
import { t } from "@/theme";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

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
  const statusStyle = ORDER_STATUS_COLOR[order.status] ?? ORDER_STATUS_COLOR.PENDING;
  return (
    <a href={`/dashboard/orders/${order.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="basita-card-interactive"
        style={{
          background: t.colors.white,
          borderRadius: t.radius.md,
          border: `1px solid ${t.colors.cream.border}`,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          direction: "rtl",
        }}
      >
        <div>
          <p style={{ margin: "0 0 4px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
            {order.orderNumber}
          </p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium }}>
            {order.buyer.name} · {order.items[0]?.nameAr ?? "منتج"}
          </p>
        </div>
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: "0 0 4px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, direction: "ltr" }}>
            {order.total} ر.س
          </p>
          <span
            style={{
              display: "inline-block",
              fontSize: t.typography.fontSize.xs,
              padding: "3px 10px",
              borderRadius: t.radius.full,
              background: statusStyle.bg,
              color: statusStyle.color,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            {ORDER_STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
      </div>
    </a>
  );
}