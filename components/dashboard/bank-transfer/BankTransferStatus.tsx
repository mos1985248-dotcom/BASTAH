// components/dashboard/bank-transfer/BankTransferStatus.tsx
// عرض فقط — يعكس حرفياً ما يرجعه GET /api/stores/bank-transfer
// (enabled, accountHolder, bankName, ibanPreview). الآيبان الكامل لا
// يظهر هنا (نفس الـAPI لا يعيده — يعرض مقنَّعاً فقط).
"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import StatusBadge from "@/components/admin/ui/StatusBadge";

interface Props {
  accountHolder: string | null;
  bankName: string | null;
  ibanPreview: string | null;
  onDisabled: () => void;
}

export default function BankTransferStatus({ accountHolder, bankName, ibanPreview, onDisabled }: Props) {
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState("");

  const handleDisable = async () => {
    if (!confirm("تعطيل التحويل البنكي؟ المشترون الحاليون ما راح يقدرون يختارونه بعدها.")) return;
    setDisabling(true);
    setError("");
    try {
      await api.delete("/api/stores/bank-transfer");
      onDisabled();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تعطيل التحويل البنكي");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing["3"] }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: t.radius.md, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Landmark size={16} strokeWidth={1.7} color={t.colors.primary[800]} />
          </span>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>التحويل البنكي</p>
        </div>
        <StatusBadge label="مفعَّل" color={t.colors.semantic.success} bg={t.colors.semantic.successBg} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>صاحب الحساب</p>
          <p style={{ margin: 0, fontSize: 13, color: t.colors.text.body }}>{accountHolder ?? "—"}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>البنك</p>
          <p style={{ margin: 0, fontSize: 13, color: t.colors.text.body }}>{bankName ?? "—"}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>رقم الآيبان</p>
          <code dir="ltr" style={{ fontSize: 13, color: t.colors.text.body }}>{ibanPreview ?? "—"}</code>
        </div>
      </div>

      {error && <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: 12, color: t.colors.semantic.danger }}>{error}</p>}

      <button
        onClick={handleDisable}
        disabled={disabling}
        style={{ marginTop: t.spacing["3"], padding: "9px 14px", borderRadius: t.radius.md, border: `1px solid ${t.colors.semantic.danger}`, background: t.colors.white, color: t.colors.semantic.danger, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: disabling ? "not-allowed" : "pointer" }}
      >
        {disabling ? "جاري التعطيل..." : "تعطيل التحويل البنكي"}
      </button>
    </div>
  );
}
