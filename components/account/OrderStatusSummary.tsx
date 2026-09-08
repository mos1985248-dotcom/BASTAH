// components/account/OrderStatusSummary.tsx
import { PackageCheck, Truck, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

const STATUS_META: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "PROCESSING", label: "قيد التجهيز", Icon: PackageCheck },
  { key: "SHIPPED", label: "في الطريق", Icon: Truck },
  { key: "DELIVERED", label: "تم التوصيل", Icon: CheckCircle2 },
  { key: "CANCELLED", label: "ملغي", Icon: XCircle },
];

export default function OrderStatusSummary({ orders }: { orders: { status: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: t.spacing["2"] }} className="basita-status-grid">
      {STATUS_META.map((s) => {
        const count = orders.filter((o) => o.status === s.key).length;
        return (
          <div key={s.key} style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "14px 8px", textAlign: "center", border: `1px solid ${t.colors.cream.border}` }}>
            <s.Icon size={20} strokeWidth={1.6} color={t.colors.primary[800]} style={{ margin: "0 auto 4px" }} />
            <div style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{count}</div>
            <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{s.label}</div>
          </div>
        );
      })}
      <style>{`
        @media (max-width: 500px) {
          .basita-status-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
