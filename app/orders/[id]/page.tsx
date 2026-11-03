// app/orders/[id]/page.tsx
// المنطق (جلب الطلب والتحقق الموثوق من الدفع عند ?justPaid=1) كما كان حرفياً؛ التغيير في العرض والصياغة فقط.
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PackageCheck, CheckCircle2, XCircle, Loader2, Clock, Landmark, MapPin, type LucideIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SiteShell from "@/components/layout/SiteShell";
import BankTransferPayment from "@/components/orders/BankTransferPayment";
import OrderStatusHeader from "@/components/orders/OrderStatusHeader";
import OrderDetailsCard from "@/components/orders/OrderDetailsCard";
import { OrderError, OrderLoading } from "@/components/orders/OrderStates";
import type { OrderDetail } from "@/components/orders/types";
import c from "@/components/orders/order.module.css";

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

  const shell = (children: React.ReactNode) => (
    <SiteShell>
      <div style={{ background: t.colors.heritage.sand }}>{children}</div>
    </SiteShell>
  );

  if (error) return shell(<OrderError message={error} />);
  if (!order) return shell(<OrderLoading />);

  const isCod = order.paymentMethod === "CASH_ON_DELIVERY";
  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";
  const isPaid = order.paymentStatus === "PAID";
  const isFailed = order.paymentStatus === "FAILED";

  // حالة واضحة ومميّزة بين: دفع إلكتروني ناجح / دفع عند الاستلام / تحويل
  // بنكي (بانتظار/تم) / بانتظار الدفع / فشل
  const statusView: { Icon: LucideIcon; title: string; note: string; spin?: boolean } = isCod
    ? { Icon: PackageCheck, title: "تم استلام طلبك — الدفع عند الاستلام", note: "ستدفع نقداً عند وصول الطلب" }
    : isPaid
    ? { Icon: CheckCircle2, title: "تم الدفع وتأكيد طلبك!", note: isBankTransfer ? "أكّد التاجر استلام التحويل البنكي" : "دفع إلكتروني ناجح عبر Moyasar" }
    : isBankTransfer
    ? { Icon: Landmark, title: order.bankTransferSubmittedAt ? "بانتظار مراجعة التاجر" : "أكمل التحويل البنكي", note: order.bankTransferSubmittedAt ? "التاجر يراجع إثبات التحويل حالياً" : "حوّل المبلغ وارفع الإثبات بالأسفل" }
    : isFailed
    ? { Icon: XCircle, title: "فشلت عملية الدفع", note: "لم يُخصم أي مبلغ — يمكنك المحاولة مرة أخرى" }
    : { Icon: verifying ? Loader2 : Clock, title: verifying ? "جاري التحقق من الدفع..." : "بانتظار تأكيد الدفع", note: "سيتحدّث هذا تلقائياً خلال لحظات", spin: verifying };

  const tone = isPaid || isCod ? "ok" : isFailed ? "bad" : "neutral";

  return shell(
    <main className={c.page} style={{ ...uiVars, maxWidth: 720 }}>
      <div className={c.stack}>
        <OrderStatusHeader
          view={statusView}
          tone={tone}
          orderNumber={order.orderNumber}
          storeName={order.store.nameAr}
          storeSlug={order.store.slug}
          status={order.status}
        />

        {isBankTransfer && !isPaid && (
          <BankTransferPayment
            orderId={id}
            bankAccount={order.bankAccount}
            pickupInfo={order.pickupInfo}
            bankTransferSubmittedAt={order.bankTransferSubmittedAt}
            onSubmitted={load}
          />
        )}

        <OrderDetailsCard order={order} />

        <section className={c.card} aria-labelledby="order-delivery-title">
          <div className={c.cardHead}>
            <MapPin size={19} strokeWidth={1.7} aria-hidden="true" />
            <h2 id="order-delivery-title" className={c.cardTitle}>الشحن إلى</h2>
          </div>
          <div className={c.cardBody}>
            <p className={c.deliver}>{order.shippingCity}، {order.shippingAddress}</p>
          </div>
        </section>

        <a href="/marketplace" className={c.cta}>متابعة التسوّق</a>
      </div>
    </main>,
  );
}
