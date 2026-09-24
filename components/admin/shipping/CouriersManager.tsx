// components/admin/shipping/CouriersManager.tsx
// مناديب المدن (بسطة للشحن) — إضافة وتفعيل/تعطيل. التسعير يبقى بشركات الشحن أعلاه.
"use client";

import { useEffect, useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";

interface Courier { id: string; city: string; name: string; phone: string; isActive: boolean; shipmentsCount: number }

const inputStyle: React.CSSProperties = {
  padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md,
  fontSize: 13, boxSizing: "border-box", minWidth: 0, flex: 1,
};

export default function CouriersManager() {
  const [couriers, setCouriers] = useState<Courier[] | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ city: "", name: "", phone: "" });

  const load = () => {
    setError("");
    api.get<{ couriers: Courier[] }>("/api/admin/couriers")
      .then((r) => setCouriers(r.couriers))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل المناديب"));
  };
  useEffect(load, []);

  const add = async () => {
    setSaving(true);
    setFormError("");
    try {
      await api.post("/api/admin/couriers", form);
      setForm({ city: "", name: "", phone: "" });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "تعذّرت الإضافة");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Courier) => {
    try {
      await api.patch(`/api/admin/couriers/${c.id}`, { isActive: !c.isActive });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر التحديث");
    }
  };

  if (error && !couriers) return <ErrorState message={error} onRetry={load} />;
  if (!couriers) return <LoadingState label="جاري تحميل المناديب..." />;

  const valid = form.city.trim().length >= 2 && form.name.trim().length >= 2 && form.phone.trim().length >= 9;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
      {couriers.length === 0 && (
        <p style={{ margin: 0, fontSize: 12, color: t.colors.text.mid }}>لا يوجد مناديب بعد — أضيفي أول مندوب بالنموذج أدناه.</p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: t.spacing["3"] }}>
        {couriers.map((c) => (
          <div key={c.id} style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["3"], opacity: c.isActive ? 1 : 0.6 }}>
            <p style={{ margin: 0, fontWeight: t.typography.fontWeight.bold, fontSize: 14, color: t.colors.text.dark }}>{c.name}</p>
            <p style={{ margin: "2px 0", fontSize: 12, color: t.colors.text.mid }}>{c.city} · <span dir="ltr">{c.phone}</span></p>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: t.colors.text.light }}>{c.shipmentsCount} شحنة</p>
            <button
              onClick={() => toggle(c)}
              style={{ padding: "6px 12px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: c.isActive ? t.colors.semantic.danger : t.colors.primary[800], fontSize: 12, cursor: "pointer" }}
            >
              {c.isActive ? "تعطيل" : "تفعيل"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["3"], display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        <div style={{ display: "flex", gap: t.spacing["2"], flexWrap: "wrap" }}>
          <input placeholder="المدينة" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} style={inputStyle} />
          <input placeholder="اسم المندوب" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <input placeholder="واتساب (05xxxxxxxx)" dir="ltr" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} />
        </div>
        {formError && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
            <AlertTriangle size={12} strokeWidth={1.8} />
            {formError}
          </p>
        )}
        <button
          onClick={add}
          disabled={saving || !valid}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: 13, fontWeight: t.typography.fontWeight.bold, cursor: saving ? "not-allowed" : "pointer", opacity: valid ? 1 : 0.6 }}
        >
          <Plus size={14} strokeWidth={2.2} />
          {saving ? "جاري الإضافة..." : "إضافة مندوب"}
        </button>
      </div>
    </div>
  );
}
