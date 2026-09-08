// components/dashboard/RecentOrdersCard.tsx
import { ArrowRight, Receipt } from "lucide-react";
import { t } from "@/theme";
import RecentOrderRow, { DashboardOrder } from "./RecentOrderRow";

export default function RecentOrdersCard({ orders }: { orders: DashboardOrder[] }) {
  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        border: `1px solid ${t.colors.cream.border}`,
        padding: t.spacing["5"],
        direction: "rtl",
        boxShadow: t.shadows.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["4"] }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          <div style={{ width: 32, height: 32, borderRadius: t.radius.full, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Receipt size={17} strokeWidth={1.8} color={t.colors.primary[800]} />
          </div>
          أحدث الطلبات
        </h3>
        <a
          href="/dashboard/orders"
          className="basita-btn-interactive"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: t.typography.fontSize.xs,
            color: t.colors.primary[800],
            background: t.colors.primary[50] || "#f4efe6",
            padding: "6px 12px",
            borderRadius: t.radius.full,
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
          }}
        >
          عرض الكل
          <ArrowRight size={13} strokeWidth={2} />
        </a>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: `${t.spacing["6"]} 0`, color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>
          لا توجد طلبات بعد
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {orders.map((o) => (
            <RecentOrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}