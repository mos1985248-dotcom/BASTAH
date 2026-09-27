// components/admin/shipping/CourierStatementModal.tsx
// كشف حساب مندوب: كل شحناته وحالتها والمبلغ المستحق له عن كل شحنة سُلِّمت.
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "بانتظار الاستلام", PICKED_UP: "تم الاستلام", IN_TRANSIT: "في الطريق",
  OUT_FOR_DELIVERY: "خرج للتسليم", DELIVERED: "تم التسليم", FAILED: "تعذّر", RETURNED: "مرتجع",
};

interface StatementRow {
  id: string; orderNumber: string; storeName: string; city: string; status: string; commission: number;
}
interface Statement {
  courier: { id: string; name: string; city: string; phone: string; commissionPerShipment: number | null };
  summary: { shipmentsCount: number; deliveredCount: number; rate: number; totalOwed: number };
  shipments: StatementRow[];
}

export default function CourierStatementModal({
  courier, onClose,
}: { courier: { id: string; name: string }; onClose: () => void }) {
  const [data, setData] = useState<Statement | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get<Statement>(`/api/admin/couriers/${courier.id}/statement`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل كشف الحساب"));
  };
  useEffect(load, [courier.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"], width: "100%", maxWidth: 640, maxHeight: "85vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["3"] }}>
          <h3 style={{ margin: 0, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>كشف حساب — {courier.name}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.colors.text.mid }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {error && <ErrorState message={error} onRetry={load} />}
        {!error && !data && <LoadingState label="جاري تحميل كشف الحساب..." />}

        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: t.spacing["2"], marginBottom: t.spacing["3"] }}>
              {[
                { label: "عدد الشحنات", value: data.summary.shipmentsCount },
                { label: "المُسلَّمة", value: data.summary.deliveredCount },
                { label: "المستحق", value: `${data.summary.totalOwed} ر.س` },
              ].map((s) => (
                <div key={s.label} style={{ background: t.colors.cream.bg, borderRadius: t.radius.md, padding: t.spacing["2"], textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>{s.label}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{s.value}</p>
                </div>
              ))}
            </div>

            {data.summary.rate === 0 && (
              <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: 11, color: t.colors.semantic.warning }}>
                لم تُحدَّد عمولة لهذا المندوب بعد — المبالغ أدناه صفر حتى تحديدها.
              </p>
            )}

            {data.shipments.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: t.colors.text.mid }}>لا توجد شحنات لهذا المندوب بعد.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "right" }}>
                  <thead>
                    <tr style={{ color: t.colors.text.mid, borderBottom: `1px solid ${t.colors.cream.border}` }}>
                      {["الطلب", "المتجر", "المدينة", "الحالة", "العمولة"].map((h) => (
                        <th key={h} style={{ padding: "6px 8px", fontWeight: t.typography.fontWeight.bold }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.shipments.map((r) => (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${t.colors.cream.border}` }}>
                        <td style={{ padding: "6px 8px" }}>{r.orderNumber}</td>
                        <td style={{ padding: "6px 8px" }}>{r.storeName}</td>
                        <td style={{ padding: "6px 8px" }}>{r.city}</td>
                        <td style={{ padding: "6px 8px" }}>{STATUS_LABEL[r.status] ?? r.status}</td>
                        <td style={{ padding: "6px 8px", fontWeight: r.commission > 0 ? t.typography.fontWeight.bold : 400, color: r.commission > 0 ? t.colors.primary[800] : t.colors.text.light }}>
                          {r.commission > 0 ? `${r.commission} ر.س` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
