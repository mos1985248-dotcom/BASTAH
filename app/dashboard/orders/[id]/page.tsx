// app/dashboard/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Landmark } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

interface OrderDetail {
  id: string; orderNumber: string; status: string; paymentStatus: string; paymentMethod: string; total: number;
  shippingName: string; shippingPhone: string; shippingCity: string; shippingAddress: string;
  buyerNotes: string | null;
  items: { nameAr: string; price: number; quantity: number; total: number }[];
  bankTransferReference: string | null;
  bankTransferProofUrl: string | null;
  bankTransferSubmittedAt: string | null;
}

const STATIC_NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  CONFIRMED: [{ value: "PROCESSING", label: "بدء التجهيز" }, { value: "CANCELLED", label: "إلغاء الطلب" }],
  PROCESSING: [{ value: "SHIPPED", label: "تم الشحن" }],
  SHIPPED: [{ value: "DELIVERED", label: "تم التسليم" }],
};

/**
 * ⚠️ إصلاح فجوة موجودة مسبقاً: NEXT_STATUS ما كانت تحوي مفتاح PENDING
 * إطلاقاً — طلبات البطاقات تنتقل لـCONFIRMED تلقائياً بمجرد نجاح الدفع
 * (webhook مويسّر، راجع lib/order-payment.ts)، لكن COD والتحويل البنكي
 * ما عندهما أي webhook، فتبقى عالقة PENDING بدون أي زر إجراء بهذي
 * الصفحة. نحسبها ديناميكياً حسب طريقة الدفع بدل تعديل الكائن الثابت:
 * - COD: يقدر التاجر يبدأ التجهيز فوراً (الدفع يصير عند التسليم أصلاً)
 * - تحويل بنكي: زر "تأكيد استلام التحويل" يظهر فقط بعد رفع المشتري
 *   للإثبات (الباكند برضو يحرس هذا الشرط بـPATCH /api/orders/[id])
 * - بطاقات (لسه PENDING): بدون زر — طلب لم يُدفع فعلياً بعد، ننتظر الـwebhook
 */
function getNextStatusOptions(order: OrderDetail): { value: string; label: string }[] | undefined {
  if (order.status !== "PENDING") return STATIC_NEXT_STATUS[order.status];
  if (order.paymentMethod === "CASH_ON_DELIVERY") {
    return [{ value: "PROCESSING", label: "بدء التجهيز" }, { value: "CANCELLED", label: "إلغاء الطلب" }];
  }
  if (order.paymentMethod === "BANK_TRANSFER" && order.bankTransferProofUrl) {
    return [{ value: "PROCESSING", label: "تأكيد استلام التحويل وبدء التجهيز" }, { value: "CANCELLED", label: "إلغاء الطلب" }];
  }
  return undefined;
}

const cardStyle = { background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"], marginBottom: t.spacing["3"] };

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState({ trackingNumber: "", carrier: "" });

  const load = () => {
    api
      .get<{ order: OrderDetail }>(`/api/orders/${id}`)
      .then(({ order }) => setOrder(order))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل الطلب"));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    setError("");
    try {
      await api.patch(`/api/orders/${id}`, { status, ...(status === "SHIPPED" ? tracking : {}) });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  if (error && !order) return (
    <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: t.spacing["10"], color: t.colors.semantic.danger }}>
      <AlertTriangle size={16} strokeWidth={1.8} />
      {error}
    </p>
  );
  if (!order) return <p style={{ textAlign: "center", padding: t.spacing["10"], color: t.colors.text.mid }}>جاري التحميل...</p>;

  const nextOptions = getNextStatusOptions(order);
  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";
  const awaitingProof = isBankTransfer && order.status === "PENDING" && !order.bankTransferProofUrl;

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={cardStyle}>
          <h1 style={{ margin: "0 0 6px", fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>{order.orderNumber}</h1>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, display: "flex", alignItems: "center", gap: 6 }}>
            الحالة:
            <span style={{ padding: "2px 10px", borderRadius: t.radius.full, background: (ORDER_STATUS_COLOR[order.status] ?? ORDER_STATUS_COLOR.PENDING).bg, color: (ORDER_STATUS_COLOR[order.status] ?? ORDER_STATUS_COLOR.PENDING).color }}>
              {ORDER_STATUS_LABEL[order.status] ?? order.status}
            </span>
            · الدفع: {order.paymentStatus}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 10px", fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>المنتجات</h3>
          {order.items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: t.typography.fontSize.sm }}>
              <span>{it.nameAr} × {it.quantity}</span>
              <span>{it.total} ر.س</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: t.typography.fontWeight.bold, marginTop: t.spacing["2"], paddingTop: t.spacing["2"], borderTop: `1px solid ${t.colors.cream.border}` }}>
            <span>الإجمالي</span>
            <span>{order.total} ر.س</span>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px", fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>الشحن إلى</h3>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>{order.shippingName} — {order.shippingPhone}</p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>{order.shippingCity}، {order.shippingAddress}</p>
        </div>

        {isBankTransfer && (
          <div style={cardStyle}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 10px", fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>
              <Landmark size={15} strokeWidth={1.8} color={t.colors.primary[800]} />
              إثبات التحويل البنكي
            </h3>
            {order.bankTransferProofUrl ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>
                  الرقم المرجعي: <strong style={{ color: t.colors.text.dark }}>{order.bankTransferReference}</strong>
                </p>
                <a href={order.bankTransferProofUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={order.bankTransferProofUrl}
                    alt="إثبات التحويل"
                    style={{ maxWidth: "100%", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}` }}
                  />
                </a>
                {order.paymentStatus !== "PAID" && (
                  <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.warning }}>
                    <AlertTriangle size={12} strokeWidth={1.8} />
                    راجعي الإيصال، ولو صحيح اضغطي "تأكيد استلام التحويل" بالأسفل
                  </p>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>المشتري لسه ما رفع إثبات التحويل.</p>
            )}
          </div>
        )}

        {nextOptions && (
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 10px", fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>تحديث الحالة</h3>
            {order.status === "PROCESSING" && (
              <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"], marginBottom: t.spacing["3"] }}>
                <input
                  placeholder="رقم التتبع"
                  value={tracking.trackingNumber}
                  onChange={(e) => setTracking((p) => ({ ...p, trackingNumber: e.target.value }))}
                  style={{ padding: 10, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, direction: "rtl" }}
                />
                <input
                  placeholder="شركة الشحن"
                  value={tracking.carrier}
                  onChange={(e) => setTracking((p) => ({ ...p, carrier: e.target.value }))}
                  style={{ padding: 10, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, direction: "rtl" }}
                />
              </div>
            )}
            <div style={{ display: "flex", gap: t.spacing["2"] }}>
              {nextOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateStatus(s.value)}
                  disabled={updating}
                  style={{
                    flex: 1, padding: 11,
                    background: s.value === "CANCELLED" ? t.colors.semantic.dangerBg : t.colors.primary[800],
                    color: s.value === "CANCELLED" ? t.colors.semantic.danger : t.colors.white,
                    border: "none", borderRadius: t.radius.md, cursor: "pointer", fontWeight: t.typography.fontWeight.bold,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {awaitingProof && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.text.mid, fontSize: t.typography.fontSize.xs, marginBottom: t.spacing["3"] }}>
            <AlertTriangle size={13} strokeWidth={1.8} />
            بانتظار المشتري يرفع إثبات التحويل — بعدها يظهر لك زر التأكيد هنا
          </p>
        )}
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs }}>
            <AlertTriangle size={13} strokeWidth={1.8} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
