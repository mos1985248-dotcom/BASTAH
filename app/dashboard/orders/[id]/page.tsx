// app/dashboard/orders/[id]/page.tsx
// المنطق (جلب الطلب، الحالات التالية، تحديث الحالة مع التتبع) كما كان حرفياً؛ التغيير في العرض والصياغة فقط.
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ChevronRight, Landmark, MapPin, ReceiptText, RefreshCw } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { uiVars } from "@/components/ui/vars";
import CourierDispatchCard from "@/components/dashboard/CourierDispatchCard";
import { OrderDetail, PAYMENT_LABEL, METHOD_LABEL, getNextStatusOptions } from "@/components/dashboard/orderDetailLogic";
import s from "@/components/dashboard/orders.module.css";

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

  const wrap = (children: React.ReactNode) => <div className={s.page} style={uiVars}>{children}</div>;

  if (error && !order) {
    return wrap(
      <p className={s.err} role="alert">
        <AlertTriangle size={16} strokeWidth={1.8} aria-hidden="true" />
        {error}
      </p>,
    );
  }
  if (!order) return wrap(<p className={s.state} role="status">جاري التحميل...</p>);

  const nextOptions = getNextStatusOptions(order);
  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";
  const awaitingProof = isBankTransfer && order.status === "PENDING" && !order.bankTransferProofUrl;

  const color = ORDER_STATUS_COLOR[order.status] ?? ORDER_STATUS_COLOR.PENDING;
  const methodLabel = METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod;

  return wrap(
    <>
      <a href="/dashboard/orders" className={s.back}>
        <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
        كل الطلبات
      </a>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{order.orderNumber}</h1>
          <div className={s.meta}>
            <span className={s.badge} style={{ color: color.color, background: color.bg }}>
              {ORDER_STATUS_LABEL[order.status] ?? order.status}
            </span>
            <span>الدفع: {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus} · {methodLabel}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className={s.err} role="alert">
          <AlertTriangle size={15} strokeWidth={1.8} aria-hidden="true" />
          {error}
        </p>
      )}

      <div className={s.detail}>
        <div className={s.col}>
          <section className={s.panel} aria-labelledby="od-items">
            <div className={s.panelHead}><ReceiptText size={18} strokeWidth={1.7} aria-hidden="true" /><h2 id="od-items" className={s.panelTitle}>المنتجات</h2></div>
            <div className={s.panelBody}>
              <ul className={s.items}>
                {order.items.map((it, i) => (
                  <li key={i} className={s.item}>
                    <span>{it.nameAr} × {it.quantity}</span>
                    <span>{it.total} ر.س</span>
                  </li>
                ))}
              </ul>
              <div className={s.total}>
                <span>الإجمالي</span>
                <span className={s.totalValue}>{order.total} ر.س</span>
              </div>
            </div>
          </section>

          <section className={s.panel} aria-labelledby="od-ship">
            <div className={s.panelHead}><MapPin size={18} strokeWidth={1.7} aria-hidden="true" /><h2 id="od-ship" className={s.panelTitle}>الشحن إلى</h2></div>
            <div className={s.panelBody}>
              <p className={s.p}>{order.shippingName} — {order.shippingPhone}</p>
              <p className={s.p}>{order.shippingCity}، {order.shippingAddress}</p>
              {order.buyerNotes && <p className={s.notes}>ملاحظات العميل: {order.buyerNotes}</p>}
            </div>
          </section>

          {isBankTransfer && (
            <section className={s.panel} aria-labelledby="od-bank">
              <div className={s.panelHead}><Landmark size={18} strokeWidth={1.7} aria-hidden="true" /><h2 id="od-bank" className={s.panelTitle}>إثبات التحويل البنكي</h2></div>
              <div className={s.panelBody}>
                {order.bankTransferProofUrl ? (
                  <>
                    <p className={s.p}>الرقم المرجعي: <strong>{order.bankTransferReference}</strong></p>
                    <a href={order.bankTransferProofUrl} target="_blank" rel="noopener noreferrer" aria-label="فتح صورة إثبات التحويل">
                      <span className={s.proof} role="img" aria-label="إثبات التحويل" style={{ backgroundImage: `url(${order.bankTransferProofUrl})` }} />
                    </a>
                    <p className={s.note}>
                      <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
                      راجع الإيصال، وإن كان صحيحاً فاضغط «تأكيد استلام التحويل» من لوحة تحديث الحالة
                    </p>
                  </>
                ) : (
                  <p className={s.p}>لم يرفع المشتري إثبات التحويل بعد.</p>
                )}
              </div>
            </section>
          )}
        </div>

        <div className={s.col}>
          {(order.status === "CONFIRMED" || order.status === "PROCESSING") && order.fulfillmentMethod !== "PICKUP" && (
            <CourierDispatchCard orderId={order.id} onDone={load} />
          )}

          {nextOptions && (
            <section className={s.panel} aria-labelledby="od-status">
              <div className={s.panelHead}><RefreshCw size={18} strokeWidth={1.7} aria-hidden="true" /><h2 id="od-status" className={s.panelTitle}>تحديث الحالة</h2></div>
              <div className={s.panelBody}>
                {order.status === "PROCESSING" && (
                  <div className={s.fields}>
                    <input className={s.field} placeholder="رقم التتبع" aria-label="رقم التتبع" value={tracking.trackingNumber} onChange={(e) => setTracking((p) => ({ ...p, trackingNumber: e.target.value }))} />
                    <input className={s.field} placeholder="شركة الشحن" aria-label="شركة الشحن" value={tracking.carrier} onChange={(e) => setTracking((p) => ({ ...p, carrier: e.target.value }))} />
                  </div>
                )}
                <div className={s.actions}>
                  {nextOptions.map((opt) => (
                    <button key={opt.value} type="button" className={`${s.btn} ${opt.value === "CANCELLED" ? s.btnDanger : ""}`} onClick={() => updateStatus(opt.value)} disabled={updating}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {awaitingProof && (
            <p className={s.note} style={{ margin: 0 }}>
              <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
              بانتظار المشتري يرفع إثبات التحويل — بعدها يظهر لك زر التأكيد هنا
            </p>
          )}
        </div>
      </div>
    </>,
  );
}
