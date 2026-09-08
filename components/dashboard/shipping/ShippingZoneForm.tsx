// components/dashboard/shipping/ShippingZoneForm.tsx
// يطابق createShippingZoneSchema/updateShippingZoneSchema بـlib/validation.ts
// حرفياً (nameAr, regions[], price, isFree, minOrderAmt?, minDays, maxDays).
"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

export interface ShippingZoneFormValues {
  nameAr: string;
  regions: string[];
  price: number;
  isFree: boolean;
  minOrderAmt?: number | null;
  minDays: number;
  maxDays: number;
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid", borderRadius: 8, fontSize: 13, boxSizing: "border-box" };

export default function ShippingZoneForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<ShippingZoneFormValues>;
  onSubmit: (values: ShippingZoneFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [nameAr, setNameAr] = useState(initial?.nameAr ?? "");
  const [regions, setRegions] = useState<string[]>(initial?.regions ?? []);
  const [regionInput, setRegionInput] = useState("");
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [isFree, setIsFree] = useState(initial?.isFree ?? false);
  const [minOrderAmt, setMinOrderAmt] = useState(initial?.minOrderAmt != null ? String(initial.minOrderAmt) : "");
  const [minDays, setMinDays] = useState(initial?.minDays != null ? String(initial.minDays) : "2");
  const [maxDays, setMaxDays] = useState(initial?.maxDays != null ? String(initial.maxDays) : "5");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addRegion = () => {
    const v = regionInput.trim();
    if (!v || regions.includes(v) || regions.length >= 30) return;
    setRegions((p) => [...p, v]);
    setRegionInput("");
  };
  const removeRegion = (v: string) => setRegions((p) => p.filter((x) => x !== v));

  const valid = nameAr.trim().length > 0 && regions.length > 0 && (isFree || Number(price) >= 0);

  const handleSubmit = async () => {
    if (!valid) {
      setError("أدخلي اسم المنطقة، منطقة واحدة على الأقل، وسعراً صحيحاً");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        nameAr: nameAr.trim(),
        regions,
        price: isFree ? 0 : Number(price),
        isFree,
        minOrderAmt: minOrderAmt !== "" ? Number(minOrderAmt) : undefined,
        minDays: Number(minDays),
        maxDays: Number(maxDays),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر حفظ المنطقة");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.lg, padding: t.spacing["4"], display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>اسم المنطقة</span>
        <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: وسط المملكة" dir="rtl" style={{ ...inputStyle, borderColor: t.colors.cream.border }} />
      </label>

      <div>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>المدن/المناطق المشمولة</span>
        {regions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {regions.map((r) => (
              <span key={r} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 8px", background: t.colors.white, borderRadius: t.radius.full, color: t.colors.text.body }}>
                {r}
                <button onClick={() => removeRegion(r)} style={{ background: "none", border: "none", cursor: "pointer", color: t.colors.text.light, fontSize: 12, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={regionInput}
            onChange={(e) => setRegionInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRegion(); } }}
            placeholder="مثال: الرياض"
            dir="rtl"
            style={{ ...inputStyle, borderColor: t.colors.cream.border }}
          />
          <button onClick={addRegion} type="button" style={{ padding: "0 14px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.primary[800], fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}>
            إضافة
          </button>
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
        <span style={{ fontSize: 13, color: t.colors.text.dark }}>شحن مجاني بهذه المنطقة</span>
      </label>

      {!isFree && (
        <label style={{ display: "block" }}>
          <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>سعر الشحن (ر.س)</span>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} dir="ltr" style={{ ...inputStyle, borderColor: t.colors.cream.border }} />
        </label>
      )}

      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>الشحن مجاني تلقائياً فوق (ر.س) — اختياري</span>
        <input type="number" min={0} value={minOrderAmt} onChange={(e) => setMinOrderAmt(e.target.value)} placeholder="بلا حد أدنى" dir="ltr" style={{ ...inputStyle, borderColor: t.colors.cream.border }} />
      </label>

      <div style={{ display: "flex", gap: t.spacing["2"] }}>
        <label style={{ flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>أقل مدة (يوم)</span>
          <input type="number" min={0} value={minDays} onChange={(e) => setMinDays(e.target.value)} dir="ltr" style={{ ...inputStyle, borderColor: t.colors.cream.border }} />
        </label>
        <label style={{ flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>أقصى مدة (يوم)</span>
          <input type="number" min={0} value={maxDays} onChange={(e) => setMaxDays(e.target.value)} dir="ltr" style={{ ...inputStyle, borderColor: t.colors.cream.border }} />
        </label>
      </div>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: t.spacing["2"] }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ flex: 1, padding: 10, borderRadius: t.radius.md, border: "none", background: saving ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white, fontWeight: t.typography.fontWeight.bold, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "جاري الحفظ..." : submitLabel}
        </button>
        <button onClick={onCancel} style={{ padding: "10px 16px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.text.mid, fontSize: 13, cursor: "pointer" }}>
          إلغاء
        </button>
      </div>
    </div>
  );
}
