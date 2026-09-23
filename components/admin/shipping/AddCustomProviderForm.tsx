// components/admin/shipping/AddCustomProviderForm.tsx
"use client";

import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: `1px solid`, borderColor: "#ddd", borderRadius: 8, fontSize: 13, boxSizing: "border-box" };

export default function AddCustomProviderForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"REST" | "MANUAL">("MANUAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [carrierKey, setCarrierKey] = useState("");
  const [displayNameAr, setDisplayNameAr] = useState("");
  // REST
  const [baseUrl, setBaseUrl] = useState("");
  const [ratePath, setRatePath] = useState("/rates");
  const [apiKey, setApiKey] = useState("");
  // MANUAL — مندوب/شركة محلية
  const [flatFee, setFlatFee] = useState("");
  const [perKgFee, setPerKgFee] = useState("0");
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [serviceCity, setServiceCity] = useState("");

  const reset = () => {
    setCarrierKey(""); setDisplayNameAr(""); setBaseUrl(""); setRatePath("/rates"); setApiKey("");
    setFlatFee(""); setPerKgFee("0"); setAgentName(""); setAgentPhone(""); setVehicleType("");
    setVehiclePlate(""); setLicenseNumber(""); setServiceCity("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const body =
        type === "REST"
          ? { providerType: "REST", carrierKey, displayNameAr, baseUrl, ratePath, apiKey }
          : { providerType: "MANUAL", carrierKey, displayNameAr, flatFee: Number(flatFee), perKgFee: Number(perKgFee), agentName, agentPhone, vehicleType, vehiclePlate, licenseNumber, serviceCity };
      await api.post("/api/admin/shipping/custom-providers", body);
      reset();
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إضافة الشركة");
    } finally {
      setSaving(false);
    }
  };

  const valid =
    carrierKey.trim().length >= 2 &&
    displayNameAr.trim().length >= 2 &&
    (type === "REST" ? baseUrl.trim() && apiKey.trim().length >= 8 : flatFee.trim() !== "" && Number(flatFee) >= 0);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: 13, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
      >
        <Plus size={14} strokeWidth={2.2} />
        إضافة شركة شحن جديدة
      </button>
    );
  }

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"], display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
      <div style={{ display: "flex", gap: t.spacing["2"] }}>
        <TypeButton active={type === "MANUAL"} onClick={() => setType("MANUAL")} label="مندوب / شركة محلية" />
        <TypeButton active={type === "REST"} onClick={() => setType("REST")} label="شركة عندها API" />
      </div>

      <Field label="معرّف مختصر (إنجليزي، بدون مسافات)" value={carrierKey} onChange={setCarrierKey} placeholder="ABHA_COURIER" dir="ltr" />
      <Field label="الاسم المعروض" value={displayNameAr} onChange={setDisplayNameAr} placeholder="مندوب توصيل أبها" />

      {type === "REST" ? (
        <>
          <Field label="رابط API الأساسي" value={baseUrl} onChange={setBaseUrl} placeholder="https://example.com" dir="ltr" />
          <Field label="مسار حساب السعر" value={ratePath} onChange={setRatePath} placeholder="/rates" dir="ltr" />
          <Field label="مفتاح API" value={apiKey} onChange={setApiKey} dir="ltr" />
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Field label="رسوم أساسية (ر.س)" value={flatFee} onChange={setFlatFee} placeholder="20" dir="ltr" type="number" />
            <Field label="رسوم إضافية لكل كجم" value={perKgFee} onChange={setPerKgFee} placeholder="0" dir="ltr" type="number" />
          </div>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>بيانات المندوب (اختيارية، للتعريف فقط):</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Field label="اسم المندوب" value={agentName} onChange={setAgentName} />
            <Field label="رقم الجوال" value={agentPhone} onChange={setAgentPhone} dir="ltr" />
            <Field label="نوع السيارة" value={vehicleType} onChange={setVehicleType} />
            <Field label="رقم اللوحة" value={vehiclePlate} onChange={setVehiclePlate} dir="ltr" />
            <Field label="رقم الرخصة" value={licenseNumber} onChange={setLicenseNumber} dir="ltr" />
            <Field label="المدينة المخدومة" value={serviceCity} onChange={setServiceCity} />
          </div>
        </>
      )}

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: t.spacing["2"] }}>
        <button onClick={() => { setOpen(false); reset(); }} style={{ padding: "9px 14px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.text.mid, fontSize: 12, cursor: "pointer" }}>
          إلغاء
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !valid}
          style={{ flex: 1, padding: 10, borderRadius: t.radius.md, border: "none", background: t.colors.primary[800], color: t.colors.white, fontWeight: t.typography.fontWeight.bold, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: !valid ? 0.6 : 1 }}
        >
          {saving ? (type === "REST" ? "جاري الحفظ والاختبار..." : "جاري الحفظ...") : "إضافة الشركة"}
        </button>
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, padding: "8px 10px", borderRadius: t.radius.md, fontSize: 12, fontWeight: t.typography.fontWeight.bold, border: `1.5px solid ${active ? t.colors.primary[800] : t.colors.cream.border}`, background: active ? t.colors.primary[100] : t.colors.white, color: active ? t.colors.primary[800] : t.colors.text.mid, cursor: "pointer" }}
    >
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, dir = "rtl", type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; dir?: string; type?: string }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 11, color: t.colors.text.mid, display: "block", marginBottom: 3 }}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir as "rtl" | "ltr"} style={inputStyle} />
    </label>
  );
}
