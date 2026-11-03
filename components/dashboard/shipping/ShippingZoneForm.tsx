// components/dashboard/shipping/ShippingZoneForm.tsx
// يطابق createShippingZoneSchema/updateShippingZoneSchema بـlib/validation.ts
// حرفياً (nameAr, regions[], price, isFree, minOrderAmt?, minDays, maxDays).
"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import f from "../forms.module.css";
import s from "./shipping.module.css";

export interface ShippingZoneFormValues {
  nameAr: string;
  regions: string[];
  price: number;
  isFree: boolean;
  minOrderAmt?: number | null;
  minDays: number;
  maxDays: number;
}

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
      setError("أدخل اسم المنطقة، منطقة واحدة على الأقل، وسعراً صحيحاً");
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
    <div className={s.form}>
      <label className={f.fieldWrap}>
        <span className={f.fieldLabel}>اسم المنطقة</span>
        <input className={f.field} value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: وسط المملكة" dir="rtl" />
      </label>

      <div>
        <span className={f.fieldLabel}>المدن/المناطق المشمولة</span>
        {regions.length > 0 && (
          <div className={`${f.tagList} ${s.tagsGap}`}>
            {regions.map((r) => (
              <span key={r} className={f.tag}>
                {r}
                <button type="button" onClick={() => removeRegion(r)} aria-label={`إزالة ${r}`}>
                  <X size={13} strokeWidth={2.2} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={f.inline}>
          <input
            className={f.field}
            value={regionInput}
            onChange={(e) => setRegionInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRegion(); } }}
            placeholder="مثال: الرياض"
            aria-label="إضافة مدينة أو منطقة"
            dir="rtl"
          />
          <button type="button" onClick={addRegion} className={f.btnSm}>إضافة</button>
        </div>
      </div>

      <label className={f.check}>
        <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
        شحن مجاني بهذه المنطقة
      </label>

      <div className={s.formGrid}>
        {!isFree && (
          <label className={f.fieldWrap}>
            <span className={f.fieldLabel}>سعر الشحن (ر.س)</span>
            <input className={`${f.field} ${f.ltr}`} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} dir="ltr" />
          </label>
        )}
        <label className={f.fieldWrap}>
          <span className={f.fieldLabel}>مجاني تلقائياً فوق (ر.س) — اختياري</span>
          <input className={`${f.field} ${f.ltr}`} type="number" min={0} value={minOrderAmt} onChange={(e) => setMinOrderAmt(e.target.value)} placeholder="بلا حد أدنى" dir="ltr" />
        </label>
        <label className={f.fieldWrap}>
          <span className={f.fieldLabel}>أقل مدة (يوم)</span>
          <input className={`${f.field} ${f.ltr}`} type="number" min={0} value={minDays} onChange={(e) => setMinDays(e.target.value)} dir="ltr" />
        </label>
        <label className={f.fieldWrap}>
          <span className={f.fieldLabel}>أقصى مدة (يوم)</span>
          <input className={`${f.field} ${f.ltr}`} type="number" min={0} value={maxDays} onChange={(e) => setMaxDays(e.target.value)} dir="ltr" />
        </label>
      </div>

      {error && (
        <p className={f.err} role="alert">
          <AlertTriangle size={13} strokeWidth={1.8} aria-hidden="true" />
          {error}
        </p>
      )}

      <div className={s.formActions}>
        <button type="button" className={f.cta} onClick={handleSubmit} disabled={saving}>{saving ? "جاري الحفظ..." : submitLabel}</button>
        <button type="button" className={`${f.cta} ${f.ghost}`} onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}
