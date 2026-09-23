// components/dashboard/shipping/CarrierConnectCard.tsx
// ⚠️ تحكّم مركزي (تغيير معماري): بيانات اعتماد كل شركة (أرامكس/SPL/أي
// شركة مخصَّصة) صارت تُدار من لوحة الإدارة مرة وحدة — التاجر هنا فقط
// يفعّل الشركة لمتجره بضغطة واحدة، بدون أي إدخال بيانات إطلاقاً.
"use client";

import { useState } from "react";
import { Truck, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

export default function CarrierConnectCard({
  carrier,
  displayNameAr,
  customProviderId,
  onConnected,
}: {
  carrier: string;
  displayNameAr: string;
  // ⚠️ إلزامي فقط لو carrier === "CUSTOM" — يحدد أي شركة من ShippingProviderConfig
  customProviderId?: string;
  onConnected: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/stores/shipping", { carrier, customProviderId });
      onConnected();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تفعيل شركة الشحن");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: t.radius.md, background: t.colors.cream.warm, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={16} strokeWidth={1.7} color={t.colors.text.body} />
          </span>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{displayNameAr}</p>
        </div>
        <button
          onClick={handleConnect}
          disabled={saving}
          style={{ padding: "7px 16px", background: saving ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "جاري التفعيل..." : "تفعيل"}
        </button>
      </div>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `${t.spacing["2"]} 0 0`, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
          {error}
        </p>
      )}
    </div>
  );
}
