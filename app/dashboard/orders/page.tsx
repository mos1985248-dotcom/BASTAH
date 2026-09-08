// app/dashboard/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

interface SellerOrder {
  id: string; orderNumber: string; status: string; paymentStatus: string; total: number;
  createdAt: string; buyer: { name: string }; items: { nameAr: string }[];
}

const STATUS_FILTERS = [
  { value: "", label: "الكل" },
  { value: "PENDING", label: "بانتظار الدفع" },
  { value: "CONFIRMED", label: "مؤكد" },
  { value: "PROCESSING", label: "قيد التجهيز" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "CANCELLED", label: "ملغي" },
];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get<{ orders: SellerOrder[] }>("/api/orders?view=seller&limit=50")
      .then((d) => setOrders(d.orders))
      .catch((err) => { if (err instanceof ApiError) setError(true); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], marginBottom: t.spacing["4"] }}>الطلبات</h1>

        <div style={{ display: "flex", gap: t.spacing["2"], overflowX: "auto", marginBottom: t.spacing["4"], paddingBottom: 4 }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: "7px 16px", borderRadius: t.radius.full, whiteSpace: "nowrap", fontSize: t.typography.fontSize.sm,
                border: `1.5px solid ${filter === f.value ? t.colors.primary[800] : t.colors.cream.border}`,
                background: filter === f.value ? t.colors.primary[100] : t.colors.white,
                color: filter === f.value ? t.colors.primary[800] : t.colors.text.mid,
                fontWeight: filter === f.value ? t.typography.fontWeight.bold : t.typography.fontWeight.regular,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: t.colors.text.mid }}>جاري التحميل...</p>}
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            تعذّر تحميل الطلبات
          </p>
        )}
        {!loading && !error && filtered.length === 0 && <p style={{ color: t.colors.text.mid }}>لا توجد طلبات بهذه الحالة</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {filtered.map((o) => {
            const s = ORDER_STATUS_COLOR[o.status] ?? ORDER_STATUS_COLOR.PENDING;
            return (
              <a key={o.id} href={`/dashboard/orders/${o.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "12px 16px", border: `1px solid ${t.colors.cream.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{o.orderNumber}</p>
                    <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{o.buyer.name} · {o.items[0]?.nameAr}</p>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <p style={{ margin: "0 0 2px", fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{o.total} ر.س</p>
                    <span style={{ fontSize: t.typography.fontSize.xs, padding: "2px 10px", borderRadius: t.radius.full, background: s.bg, color: s.color }}>
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
