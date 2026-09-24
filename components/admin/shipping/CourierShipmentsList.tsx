// components/admin/shipping/CourierShipmentsList.tsx
// آخر شحنات مناديب بسطة — قراءة فقط. الحالة تُحدَّث من التاجر (تم الشحن/تم التسليم).
"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";

interface CourierShipment {
  id: string; status: string; createdAt: string;
  courier: { name: string; city: string } | null;
  order: { orderNumber: string; shippingCity: string; total: number; paymentMethod: string; store: { nameAr: string } };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "بانتظار الاستلام", PICKED_UP: "تم الاستلام", IN_TRANSIT: "في الطريق",
  OUT_FOR_DELIVERY: "خرج للتسليم", DELIVERED: "تم التسليم", FAILED: "تعذّر", RETURNED: "مرتجع",
};

export default function CourierShipmentsList() {
  const [rows, setRows] = useState<CourierShipment[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get<{ shipments: CourierShipment[] }>("/api/admin/courier-shipments")
      .then((r) => setRows(r.shipments))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل الشحنات"));
  };
  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <LoadingState label="جاري تحميل الشحنات..." />;
  if (rows.length === 0) return <p style={{ margin: 0, fontSize: 12, color: t.colors.text.mid }}>لم يُسند أي طلب لمندوب بعد.</p>;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "right" }}>
        <thead>
          <tr style={{ color: t.colors.text.mid, borderBottom: `1px solid ${t.colors.cream.border}` }}>
            {["الطلب", "المتجر", "المدينة", "المندوب", "التحصيل", "الحالة"].map((h) => (
              <th key={h} style={{ padding: "8px 10px", fontWeight: t.typography.fontWeight.bold }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: `1px solid ${t.colors.cream.border}` }}>
              <td style={{ padding: "8px 10px" }}>{r.order.orderNumber}</td>
              <td style={{ padding: "8px 10px" }}>{r.order.store.nameAr}</td>
              <td style={{ padding: "8px 10px" }}>{r.order.shippingCity}</td>
              <td style={{ padding: "8px 10px" }}>{r.courier?.name ?? "—"}</td>
              <td style={{ padding: "8px 10px" }}>{r.order.paymentMethod === "CASH_ON_DELIVERY" ? `${r.order.total} ر.س` : "مدفوع"}</td>
              <td style={{ padding: "8px 10px" }}>{STATUS_LABEL[r.status] ?? r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
