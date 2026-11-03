// app/dashboard/payment-gateway/page.tsx
// يستخدم GET/POST /api/stores/payment-gateway الجاهزين فعلياً بلا أي
// تعديل عليهما أو على السكيما أو التشفير أو الـcheckout/webhook.
// المنطق كما كان حرفياً؛ التغيير في التخطيط والعرض فقط.
"use client";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import PaymentGatewayForm from "@/components/dashboard/payment-gateway/PaymentGatewayForm";
import PaymentGatewayStatus from "@/components/dashboard/payment-gateway/PaymentGatewayStatus";
import s from "@/components/dashboard/forms.module.css";

interface GatewayStatus {
  connected: boolean;
  publishableKey: string | null;
  connectedAt: string | null;
}

export default function PaymentGatewayPage() {
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get<GatewayStatus>("/api/stores/payment-gateway")
      .then(setStatus)
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل حالة بوابة الدفع"));
  };

  useEffect(load, []);

  const wrap = (children: React.ReactNode) => <div className={s.page} style={uiVars}>{children}</div>;

  if (error) return wrap(<ErrorState message={error} onRetry={load} />);
  if (!status) return wrap(<LoadingState label="جاري تحميل بوابة الدفع..." />);

  return wrap(
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>بوابة الدفع</h1>
          <p className={s.sub}>اربط حساب Moyasar الخاص بمتجرك لاستقبال المدفوعات الإلكترونية</p>
        </div>
      </div>
      <div className={s.layoutEq}>
        {status.connected ? (
          <PaymentGatewayStatus publishableKey={status.publishableKey} connectedAt={status.connectedAt} />
        ) : (
          <PaymentGatewayForm onConnected={load} />
        )}
        <section className={s.panel} aria-labelledby="gw-info">
          <div className={s.panelHead}><h2 id="gw-info" className={s.panelTitle}>كيف تعمل البوابة؟</h2></div>
          <div className={s.panelBody}>
            <p className={s.note}>
              <ShieldCheck size={15} strokeWidth={1.8} aria-hidden="true" />
              بسطة لا تخزّن ولا ترى بيانات بطاقة عميلك أبداً — الدفع يتم بالكامل عبر صفحة Moyasar المستضافة.
            </p>
            <ol className={s.help} style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2.2 }}>
              <li>أدخل المفتاحين العلني والسري من حساب Moyasar الخاص بمتجرك.</li>
              <li>أضف رابط الـ Webhook المعروض في لوحة تحكم Moyasar مرة واحدة.</li>
              <li>الصق سر الـ Webhook ثم احفظ — سنتحقق من المفتاح السري قبل قبوله.</li>
            </ol>
          </div>
        </section>
      </div>
    </>,
  );
}
