// components/admin/shipping/PlatformCarrierCard.tsx
// ⚠️ الحقول المطلوبة (requiredCredentialFields) تختلف فعلياً بين
// أرامكس (6 حقول) وSPL (3 حقول) — تُبنى النموذج ديناميكياً من القائمة
// اللي يرجعها GET /api/admin/shipping/platform-credentials، لا حقول
// ثابتة هنا، حتى ما ننكسر لو تغيّرت متطلبات شركة بالمستقبل.
"use client";

import { useState } from "react";
import { Truck, ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import StatusBadge from "@/components/admin/ui/StatusBadge";

export interface PlatformCarrier {
  carrier: string;
  configured: boolean;
  isActive: boolean;
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
  requiredCredentialFields: string[];
}

const CARRIER_LABELS: Record<string, string> = { ARAMEX: "أرامكس", SPL: "البريد السعودي (SPL)" };

export default function PlatformCarrierCard({ carrier, onChanged }: { carrier: PlatformCarrier; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(Object.fromEntries(carrier.requiredCredentialFields.map((f) => [f, ""])));
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/admin/shipping/platform-credentials", { carrier: carrier.carrier, credentials: form });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      await api.patch("/api/admin/shipping/platform-credentials", { carrier: carrier.carrier, isActive: !carrier.isActive });
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
          <span style={{ width: 34, height: 34, borderRadius: t.radius.md, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={17} strokeWidth={1.7} color={t.colors.primary[800]} />
          </span>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            {CARRIER_LABELS[carrier.carrier] ?? carrier.carrier}
          </p>
        </div>
        {carrier.configured ? (
          <StatusBadge
            label={carrier.isActive ? "نشطة" : "معطَّلة"}
            color={carrier.isActive ? t.colors.semantic.success : t.colors.text.light}
            bg={carrier.isActive ? t.colors.semantic.successBg : t.colors.cream.bg}
          />
        ) : (
          <StatusBadge label="غير مضبوطة" color={t.colors.semantic.warning} bg={t.colors.semantic.warningBg} />
        )}
      </div>

      {carrier.configured && carrier.lastTestedAt && (
        <p style={{ display: "flex", alignItems: "center", gap: 5, margin: `${t.spacing["2"]} 0 0`, fontSize: 11, color: carrier.lastTestOk ? t.colors.semantic.success : t.colors.semantic.danger }}>
          {carrier.lastTestOk ? <CheckCircle2 size={11} strokeWidth={2} /> : <AlertTriangle size={11} strokeWidth={1.8} />}
          {carrier.lastTestOk ? "آخر اختبار اتصال ناجح" : "آخر اختبار اتصال فشل — راجعي البيانات"}
        </p>
      )}

      <div style={{ display: "flex", gap: t.spacing["2"], marginTop: t.spacing["3"] }}>
        <button
          onClick={() => setEditing((v) => !v)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.cream.warm, color: t.colors.primary[800], fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
        >
          {carrier.configured ? "تعديل المفاتيح" : "ضبط المفاتيح"}
          <ChevronDown size={13} style={{ transform: editing ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>
        {carrier.configured && (
          <button
            onClick={handleToggle}
            disabled={toggling}
            style={{ padding: "8px 16px", borderRadius: t.radius.md, border: `1px solid ${carrier.isActive ? t.colors.semantic.danger : t.colors.semantic.success}`, background: t.colors.white, color: carrier.isActive ? t.colors.semantic.danger : t.colors.semantic.success, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: toggling ? "not-allowed" : "pointer" }}
          >
            {carrier.isActive ? "تعطيل" : "تفعيل"}
          </button>
        )}
      </div>

      {editing && (
        <div style={{ marginTop: t.spacing["3"], paddingTop: t.spacing["3"], borderTop: `1px solid ${t.colors.cream.border}`, display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {carrier.requiredCredentialFields.map((field) => (
            <input
              key={field}
              value={form[field] ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              placeholder={field}
              dir="ltr"
              style={{ padding: "8px 10px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 12 }}
            />
          ))}
          {error && <p style={{ margin: 0, fontSize: 11, color: t.colors.semantic.danger }}>{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || carrier.requiredCredentialFields.some((f) => !form[f]?.trim())}
            style={{ padding: 9, borderRadius: t.radius.md, border: "none", background: t.colors.primary[800], color: t.colors.white, fontWeight: t.typography.fontWeight.bold, fontSize: 12, cursor: saving ? "not-allowed" : "pointer", opacity: carrier.requiredCredentialFields.some((f) => !form[f]?.trim()) ? 0.6 : 1 }}
          >
            {saving ? "جاري الحفظ والاختبار..." : "حفظ واختبار الاتصال"}
          </button>
        </div>
      )}
    </div>
  );
}
