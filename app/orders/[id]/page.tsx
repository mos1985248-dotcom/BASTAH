// app/orders/[id]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AlertTriangle, PackageCheck, CheckCircle2, XCircle, Loader2, Clock, Landmark, type LucideIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import BankTransferPayment from "@/components/orders/BankTransferPayment";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

interface OrderDetail {
  orderNumber: string; status: string; paymentStatus: string; paymentMethod: string;
  subtotal: number; shippingCost: number; codFee: number; discountAmount: number; taxAmount: number; total: number;
  shippingCity: string; shippingAddress: string;
  store: { nameAr: string; slug: string };
  items: { nameAr: string; quantity: number; total: number }[];
  bankAccount?: { iban: string | null; accountHolder: string | null; bankName: string | null };
  pickupInfo?: { city: string | null; region: string | null; latitude: number | null; longitude: number | null };
  bankTransferSubmittedAt: string | null;
}

// ⚠️ لا نعتبر نجاح الـredirect من Moyasar وحده دليلاً نهائياً على نجاح
// الدفع — لو رجع المشتري بـ ?justPaid=1 وكانت الحالة ما زالت PENDING،
// نستدعي تحقّقاً موثوقاً مباشراً من Moyasar (وليس ثقة عمياء بالـwebhook
// وحده أيضاً، فقد يتأخر ثوانٍ قليلة).
export default function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("justPaid") === "1";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const attemptedVerify = useRef(false);

  const load = () =>
    api
      .get<{ order: OrderDetail }>(`/api/orders/${id}`)
      .then(({ order }) => setOrder(order))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل الطلب"));

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (!justPaid || !order || attemptedVerify.current) return;
    if (order.paymentMethod === "CASH_ON_DELIVERY" || order.paymentMethod === "BANK_TRANSFER" || order.paymentStatus !== "PENDING") return;

    attemptedVerify.current = true;
    setVerifying(true);
    api
      .post(`/api/orders/${id}/verify-payment`, {})
      .then(() => load())
      .catch(() => {})
      .finally(() => setVerifying(false));
  }, [justPaid, order, id]);

  if (error) {
    return (
      <SiteShell>
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: t.spacing["12"], color: t.colors.semantic.danger }}>
          <AlertTriangle size={16} strokeWidth={1.8} />
          {error}
        </p>
      </SiteShell>
    );
  }
  if (!order) {
    return (
      <SiteShell>
        <p style={{ textAlign: "center", padding: t.spacing["12"], color: t.colors.text.mid }}>جاري التحميل...</p>
      </SiteShell>
    );
  }

  const isCod = order.paymentMethod === "CASH_ON_DELIVERY";
  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";
  const isPaid = order.paymentStatus === "PAID";
  const isFailed = order.paymentStatus === "FAILED";

  // حالة واضحة ومميّزة بين: دفع إلكتروني ناجح / دفع عند الاستلام / تحويل
  // بنكي (بانتظار/تم) / بانتظار الدفع / فشل
  const statusView: { Icon: LucideIcon; title: string; note: string; spin?: boolean } = isCod
    ? { Icon: PackageCheck, title: "تم استلام طلبك — الدفع عند الاستلام", note: "ستدفعين نقداً عند وصول الطلب" }
    : isPaid
    ? { Icon: CheckCircle2, title: "تم الدفع وتأكيد طلبك!", note: isBankTransfer ? "أكّد التاجر استلام التحويل البنكي" : "دفع إلكتروني ناجح عبر Moyasar" }
    : isBankTransfer
    ? { Icon: Landmark, title: order.bankTransferSubmittedAt ? "بانتظار مراجعة التاجر" : "أكملي التحويل البنكي", note: order.bankTransferSubmittedAt ? "التاجر يراجع إثبات التحويل حالياً" : "حوّلي المبلغ وارفعي الإثبات بالأسفل" }
    : isFailed
    ? { Icon: XCircle, title: "فشلت عملية الدفع", note: "لم يُخصم أي مبلغ — يمكنك المحاولة مرة أخرى" }
    : { Icon: verifying ? Loader2 : Clock, title: verifying ? "جاري التحقق من الدفع..." : "بانتظار تأكيد الدفع", note: "سيتحدّث هذا تلقائياً خلال لحظات", spin: verifying };

  return (
    <SiteShell>
      <div style={{ padding: t.spacing["5"] }}>
        <div style={{ maxWidth: 460, margin: "0 auto", background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["6"], textAlign: "center" }}>
          <statusView.Icon
            size={44}
            strokeWidth={1.6}
            color={isPaid || isCod ? t.colors.semantic.success : isFailed ? t.colors.semantic.danger : t.colors.text.light}
            style={{ margin: "0 auto", animation: statusView.spin ? "basita-spin 1s linear infinite" : undefined }}
          />
          <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], margin: "10px 0 4px" }}>{statusView.title}</h1>
          <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, marginBottom: t.spacing["2"] }}>
            {order.orderNumber} · {order.store.nameAr}
          </p>
          <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["5"] }}>{statusView.note}</p>

          {isBankTransfer && !isPaid && (
            <BankTransferPayment
              orderId={id}
              bankAccount={order.bankAccount}
              pickupInfo={order.pickupInfo}
              bankTransferSubmittedAt={order.bankTransferSubmittedAt}
              onSubmitted={load}
            />
          )}

          <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.lg, padding: t.spacing["4"], textAlign: "right", marginBottom: t.spacing["4"] }}>
            {order.items.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: t.typography.fontSize.sm, padding: "4px 0" }}>
                <span>{it.nameAr} × {it.quantity}</span>
                <span>{it.total} ر.س</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${t.colors.cream.border}`, marginTop: t.spacing["2"], paddingTop: t.spacing["2"] }}>
              <Row label="المجموع الفرعي" value={order.subtotal} />
              <Row label="التوصيل" value={order.shippingCost} freeLabel="مجاني" />
              {order.codFee > 0 && <Row label="رسوم الدفع عند الاستلام" value={order.codFee} />}
              {order.discountAmount > 0 && <Row label="الخصم" value={-order.discountAmount} />}
              {order.taxAmount > 0 && <Row label="ضريبة القيمة المضافة (15٪)" value={order.taxAmount} />}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: t.typography.fontWeight.bold, marginTop: t.spacing["1"] }}>
                <span>الإجمالي</span>
                <span>{order.total} ر.س</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
            الحالة: <strong>{ORDER_STATUS_LABEL[order.status] ?? order.status}</strong>
          </p>
          <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
            الشحن إلى: {order.shippingCity}، {order.shippingAddress}
          </p>

          <a
            href="/marketplace"
            style={{ display: "inline-block", marginTop: t.spacing["4"], padding: "10px 24px", background: t.colors.primary[800], color: t.colors.white, borderRadius: t.radius.lg, textDecoration: "none", fontWeight: t.typography.fontWeight.bold }}
          >
            متابعة التسوّق
          </a>
        </div>
      </div>
      <style>{`@keyframes basita-spin { to { transform: rotate(360deg); } }`}</style>
    </SiteShell>
  );
}

function Row({ label, value, freeLabel }: { label: string; value: number; freeLabel?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, padding: "2px 0" }}>
      <span>{label}</span>
      <span>{value === 0 && freeLabel ? freeLabel : `${value} ر.س`}</span>
    </div>
  );
}
