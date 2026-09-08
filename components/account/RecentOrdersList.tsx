// components/account/RecentOrdersList.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

export interface BuyerOrder {
  id: string; orderNumber: string; status: string; total: number; createdAt: string;
  store: { nameAr: string; slug: string };
  items: { nameAr: string }[];
}

export default function RecentOrdersList({ orders, loading, error }: { orders: BuyerOrder[]; loading: boolean; error?: boolean }) {
  if (loading) return <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>جاري التحميل...</p>;
  if (error) return (
    <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.sm }}>
      <AlertTriangle size={15} strokeWidth={1.8} />
      تعذّر تحميل الطلبات، حاولي تحديث الصفحة
    </p>
  );
  if (orders.length === 0) return <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>لا توجد طلبات بعد</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
      {orders.map((o) => {
        const statusStyle = ORDER_STATUS_COLOR[o.status] ?? ORDER_STATUS_COLOR.PENDING;
        return (
        <a key={o.id} href={`/orders/${o.id}`} style={{ textDecoration: "none" }}>
          <div style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${t.colors.cream.border}` }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{o.store.nameAr}</p>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{o.orderNumber} · {o.items[0]?.nameAr}</p>
            </div>
            <div style={{ textAlign: "end" }}>
              <p style={{ margin: "0 0 2px", fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{o.total} ر.س</p>
              <span style={{ fontSize: t.typography.fontSize.xs, padding: "2px 10px", borderRadius: t.radius.full, background: statusStyle.bg, color: statusStyle.color }}>
                {ORDER_STATUS_LABEL[o.status] ?? o.status}
              </span>
            </div>
          </div>
        </a>
        );
      })}
    </div>
  );
}
