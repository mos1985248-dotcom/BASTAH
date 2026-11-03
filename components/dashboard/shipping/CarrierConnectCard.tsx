// components/dashboard/shipping/CarrierConnectCard.tsx
// ⚠️ تحكّم مركزي (تغيير معماري): بيانات اعتماد كل شركة (أرامكس/SPL/أي
// شركة مخصَّصة) صارت تُدار من لوحة الإدارة مرة وحدة — التاجر هنا فقط
// يفعّل الشركة لمتجره بضغطة واحدة، بدون أي إدخال بيانات إطلاقاً.
"use client";

import { useState } from "react";
import { Truck, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import f from "../forms.module.css";
import s from "./shipping.module.css";

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
    <div className={`${s.card} ${s.cardAvail}`}>
      <div className={s.cardTop}>
        <div className={s.lead}>
          <span className={s.iconBox}>
            <Truck size={19} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <p className={s.name}>{displayNameAr}</p>
        </div>
        <button type="button" onClick={handleConnect} disabled={saving} className={`${f.btnSm} ${f.btnPrimary}`}>
          {saving ? "جاري التفعيل..." : "تفعيل"}
        </button>
      </div>
      {error && (
        <p className={f.err} role="alert">
          <AlertTriangle size={13} strokeWidth={1.8} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
