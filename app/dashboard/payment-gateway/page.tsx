// app/dashboard/payment-gateway/page.tsx
// يستخدم GET/POST /api/stores/payment-gateway الجاهزين فعلياً بلا أي
// تعديل عليهما أو على السكيما أو التشفير أو الـcheckout/webhook.
"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import PaymentGatewayForm from "@/components/dashboard/payment-gateway/PaymentGatewayForm";
import PaymentGatewayStatus from "@/components/dashboard/payment-gateway/PaymentGatewayStatus";

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

  if (error) return <div style={{ padding: t.spacing["4"] }}><ErrorState message={error} onRetry={load} /></div>;
  if (!status) return <LoadingState label="جاري تحميل بوابة الدفع..." />;

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], margin: `0 0 ${t.spacing["4"]}` }}>بوابة الدفع</h1>

        {status.connected ? (
          <PaymentGatewayStatus publishableKey={status.publishableKey} connectedAt={status.connectedAt} />
        ) : (
          <PaymentGatewayForm onConnected={load} />
        )}
      </div>
    </div>
  );
}
