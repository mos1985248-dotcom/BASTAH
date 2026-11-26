// components/admin/shipping/CustomProviderCard.tsx
"use client";

import { useState } from "react";
import { Truck, User, Phone, Car, FileBadge } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import StatusBadge from "@/components/admin/ui/StatusBadge";

export interface CustomProvider {
  id: string;
  carrierKey: string;
  displayNameAr: string;
  providerType: "REST" | "MANUAL";
  baseUrl: string | null;
  flatFee: number | null;
  perKgFee: number | null;
  agentName: string | null;
  agentPhone: string | null;
  vehicleType: string | null;
  vehiclePlate: string | null;
  licenseNumber: string | null;
  serviceCity: string | null;
  isActive: boolean;
  connectedStores: number;
}

export default function CustomProviderCard({ provider, onChanged }: { provider: CustomProvider; onChanged: () => void }) {
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(provider.displayNameAr);
  const [flat, setFlat] = useState(String(provider.flatFee ?? 0));
  const [kg, setKg] = useState(String(provider.perKgFee ?? 0));
  const [city, setCity] = useState(provider.serviceCity ?? "");
  const openSettings = () => {
    setName(provider.displayNameAr); setFlat(String(provider.flatFee ?? 0));
    setKg(String(provider.perKgFee ?? 0)); setCity(provider.serviceCity ?? "");
    setError(""); setEditing(true);
  };
  const valid = name.trim().length >= 2 && name.trim().length <= 120 && city.trim().length <= 120 &&
    [flat, kg].every(v => v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100000);
  const saveSettings = async () => {
    if (!valid || saving) return;
    setSaving(true); setError("");
    try {
      await api.patch("/api/admin/shipping/custom-providers", { id: provider.id, settings: { displayNameAr: name.trim(), flatFee: Number(flat), perKgFee: Number(kg), serviceCity: city.trim() } });
      setEditing(false); onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ الإعدادات");
    } finally { setSaving(false); }
  };
  const fieldStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "8px", border: "1px solid #ddd", borderRadius: 8, font: "inherit" };

  const handleToggle = async () => {
    setToggling(true);
    setError("");
    try {
      await api.patch("/api/admin/shipping/custom-providers", { id: provider.id, isActive: !provider.isActive });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تغيير الحالة");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: t.radius.md, background: t.colors.cream.warm, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={17} strokeWidth={1.7} color={t.colors.text.body} />
          </span>
          <div>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{provider.displayNameAr}</p>
            <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>{provider.providerType === "REST" ? "شركة عندها API" : "مندوب / شركة محلية"}</p>
          </div>
        </div>
        <StatusBadge
          label={provider.isActive ? "نشطة" : "معطَّلة"}
          color={provider.isActive ? t.colors.semantic.success : t.colors.text.light}
          bg={provider.isActive ? t.colors.semantic.successBg : t.colors.cream.bg}
        />
      </div>

      {provider.providerType === "MANUAL" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: t.spacing["2"], fontSize: 12, color: t.colors.text.mid }}>
          {provider.agentName && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><User size={12} strokeWidth={1.8} />{provider.agentName}</span>}
          {provider.agentPhone && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={12} strokeWidth={1.8} />{provider.agentPhone}</span>}
          {provider.vehicleType && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Car size={12} strokeWidth={1.8} />{provider.vehicleType}{provider.vehiclePlate ? ` — ${provider.vehiclePlate}` : ""}</span>}
          {provider.licenseNumber && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FileBadge size={12} strokeWidth={1.8} />رخصة: {provider.licenseNumber}</span>}
          {provider.serviceCity && <span>يخدم مدينة: {provider.serviceCity}</span>}
          <span>السعر: {provider.flatFee} ر.س أساس + {provider.perKgFee} ر.س/كجم</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: t.spacing["3"] }}>
        <span style={{ fontSize: 11, color: t.colors.text.light }}>{provider.connectedStores} متجر مربوط</span>
        <button
          onClick={handleToggle}
          disabled={toggling || saving || editing}
          style={{ padding: "7px 16px", borderRadius: t.radius.md, border: `1px solid ${provider.isActive ? t.colors.semantic.danger : t.colors.semantic.success}`, background: t.colors.white, color: provider.isActive ? t.colors.semantic.danger : t.colors.semantic.success, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: toggling ? "not-allowed" : "pointer" }}
        >
          {provider.isActive ? "تعطيل" : "تفعيل"}
        </button>
      </div>
      {provider.providerType === "MANUAL" && !editing && (
        <button type="button" onClick={openSettings} disabled={toggling} style={{ marginTop: 10, width: "100%", padding: 8, borderRadius: t.radius.md, border: "1px solid " + t.colors.cream.border, background: t.colors.cream.warm, color: t.colors.primary[800], fontSize: 13, cursor: "pointer" }}>إعدادات الشركة</button>
      )}
      {editing && (
        <form onSubmit={e => { e.preventDefault(); void saveSettings(); }} style={{ display: "grid", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid " + t.colors.cream.border, fontSize: 13 }}>
          <label>اسم الشركة<input style={fieldStyle} required maxLength={120} value={name} onChange={e => setName(e.target.value)} disabled={saving} /></label>
          <label>سعر التوصيل الأساسي (ر.س)<input style={fieldStyle} type="number" min="0" max="100000" step="0.01" required value={flat} onChange={e => setFlat(e.target.value)} disabled={saving} /></label>
          <label>رسوم لكل كيلوجرام (ر.س)<input style={fieldStyle} type="number" min="0" max="100000" step="0.01" required value={kg} onChange={e => setKg(e.target.value)} disabled={saving} /></label>
          <label>مدينة الخدمة (بيانات تعريفية)<input style={fieldStyle} maxLength={120} value={city} onChange={e => setCity(e.target.value)} disabled={saving} /></label>
          <p style={{ margin: 0, fontSize: 12, color: t.colors.text.mid }}>الأسعار تخص الطلبات الجديدة. المدينة هنا للتعريف فقط؛ رسوم المنصة والدفع عند الاستلام تُدار من الإعدادات العامة.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={!valid || saving} style={{ flex: 1, padding: 9, border: 0, borderRadius: 8, background: t.colors.primary[800], color: t.colors.white }}>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</button>
            <button type="button" disabled={saving} onClick={() => { setEditing(false); setError(""); }} style={{ padding: 9, border: "1px solid #ddd", borderRadius: 8, background: t.colors.white }}>إلغاء</button>
          </div>
        </form>
      )}
      {error && <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: 11, color: t.colors.semantic.danger }}>{error}</p>}
    </div>
  );
}
