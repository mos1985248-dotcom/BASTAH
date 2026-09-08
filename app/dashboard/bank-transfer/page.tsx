// app/dashboard/bank-transfer/page.tsx
// يستخدم GET/POST/DELETE /api/stores/bank-transfer الجاهزين فعلياً بلا
// أي تعديل عليهما أو على السكيما أو الـcheckout.
"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import BankTransferForm from "@/components/dashboard/bank-transfer/BankTransferForm";
import BankTransferStatus from "@/components/dashboard/bank-transfer/BankTransferStatus";

interface BankTransferStatusResponse {
  enabled: boolean;
  accountHolder: string | null;
  bankName: string | null;
  ibanPreview: string | null;
}

export default function BankTransferPage() {
  const [status, setStatus] = useState<BankTransferStatusResponse | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get<BankTransferStatusResponse>("/api/stores/bank-transfer")
      .then(setStatus)
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل حالة التحويل البنكي"));
  };

  useEffect(load, []);

  if (error) return <div style={{ padding: t.spacing["4"] }}><ErrorState message={error} onRetry={load} /></div>;
  if (!status) return <LoadingState label="جاري تحميل التحويل البنكي..." />;

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], margin: `0 0 ${t.spacing["4"]}` }}>التحويل البنكي</h1>

        {status.enabled ? (
          <BankTransferStatus
            accountHolder={status.accountHolder}
            bankName={status.bankName}
            ibanPreview={status.ibanPreview}
            onDisabled={load}
          />
        ) : (
          <BankTransferForm onConnected={load} />
        )}
      </div>
    </div>
  );
}
