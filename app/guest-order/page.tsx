"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteShell from "@/components/layout/SiteShell";
import { api } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import s from "@/components/product/guest-checkout.module.css";

const states: Record<string, string> = {
  PENDING: "بانتظار تأكيد التاجر", CONFIRMED: "تم التأكيد", PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن", DELIVERED: "تم التسليم", CANCELLED: "أُلغي الطلب", RETURNED: "تم الإرجاع",
};

function OrderStatus() {
  const id = useSearchParams().get("id") ?? "";
  const [order, setOrder] = useState<{ orderNumber: string; status: string; total: number } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setOrder(null);
    setError(false);
    api.get<{ orderNumber: string; status: string; total: number }>(`/api/guest-checkout/status?id=${encodeURIComponent(id)}`)
      .then((value) => { if (active) setOrder(value); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [id]);

  return (
    <main className={s.status} style={uiVars}>
      <div className={s.form}>
        <h2>متابعة طلب الزائر</h2>
        {error ? <p role="alert">الطلب غير متاح في هذه الجلسة.</p> : order ? (
          <div role="status">
            <p>رقم الطلب <bdi>{order.orderNumber}</bdi></p>
            <p>{states[order.status] ?? order.status}</p>
            <p>الإجمالي {order.total.toFixed(2)} ر.س</p>
          </div>
        ) : <p role="status">جارٍ تحميل الطلب…</p>}
      </div>
    </main>
  );
}

export default function GuestOrderPage() {
  return <SiteShell><Suspense fallback={null}><OrderStatus /></Suspense></SiteShell>;
}
