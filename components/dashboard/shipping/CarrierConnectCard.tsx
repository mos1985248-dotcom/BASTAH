// components/dashboard/shipping/CarrierConnectCard.tsx
// نموذج ربط شركة شحن غير مربوطة بعد — POST /api/stores/shipping (يختبر
// بيانات الاعتماد حقيقياً عند الشركة قبل الحفظ، ويرجع 422 لو غير صحيحة).
"use client";

import { useState } from "react";
import { Truck, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import { CARRIER_CREDENTIAL_FIELDS } from "./carrierFields";

export default function CarrierConnectCard({
  carrier,
  displayNameAr,
  onConnected,
}: {
  carrier: string;
  displayNameAr: string;
  onConnected: () => void;
}) {
  const fields = CARRIER_CREDENTIAL_FIELDS[carrier] ?? [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/stores/shipping", { carrier, credentials: form });
      setOpen(false);
      setForm({});
      onConnected();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر ربط شركة الشحن");
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
        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{ padding: "7px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
          >
            ربط الحساب
          </button>
        )}
      </div>

      {open && (
        <div style={{ marginTop: t.spacing["3"], display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {fields.map((f) => (
            <label key={f.key} style={{ display: "block" }}>
              <span style={{ fontSize: 11, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 3, color: t.colors.text.dark }}>{f.labelAr}</span>
              <input
                type={f.secret ? "password" : "text"}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                dir={f.dir ?? "rtl"}
                style={{ width: "100%", padding: "8px 11px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
              />
            </label>
          ))}

          {error && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
              <AlertTriangle size={12} strokeWidth={1.8} />
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: t.spacing["2"], marginTop: 4 }}>
            <button
              onClick={handleConnect}
              disabled={saving || fields.some((f) => !form[f.key]?.trim())}
              style={{
                flex: 1, padding: 10, borderRadius: t.radius.md, border: "none",
                background: saving ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white,
                fontWeight: t.typography.fontWeight.bold, fontSize: 13,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: fields.some((f) => !form[f.key]?.trim()) ? 0.6 : 1,
              }}
            >
              {saving ? "جاري التحقق والربط..." : "تأكيد الربط"}
            </button>
            <button
              onClick={() => { setOpen(false); setError(""); setForm({}); }}
              style={{ padding: "10px 16px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.text.mid, fontSize: 13, cursor: "pointer" }}
            >
              إلغاء
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>
            سنختبر هذه البيانات مباشرة عند {displayNameAr} قبل حفظها — لن
            تُحفظ إن كانت غير صحيحة.
          </p>
        </div>
      )}
    </div>
  );
}
