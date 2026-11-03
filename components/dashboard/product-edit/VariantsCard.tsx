// components/dashboard/product-edit/VariantsCard.tsx
// متغيرات المنتج (اختيارية): اسم الخاصية نص حر (المقاس، الوزن، اللون...) + صفوف قيمة/سعر/كمية/SKU.
// منتج بدون صفوف يبقى كما هو تماماً — الكمية الكلية تُحسب من المتغيرات على السيرفر.
// المنطق (التحقق والحفظ عبر /api/products/:id/variants) كما كان حرفياً؛ التغيير في الشكل فقط.
"use client";
import { useState } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

export interface EditVariant {
  id: string;
  options: { name: string; value: string }[];
  price: number | null;
  quantity: number;
  sku: string | null;
}

interface Row { key: string; id?: string; value: string; price: string; quantity: string; sku: string }

let rowCounter = 0;
const blankRow = (): Row => ({ key: `new-${++rowCounter}`, value: "", price: "", quantity: "0", sku: "" });
const toRow = (v: EditVariant): Row => ({
  key: v.id, id: v.id, value: v.options?.[0]?.value ?? "",
  price: v.price == null ? "" : String(v.price), quantity: String(v.quantity), sku: v.sku ?? "",
});

export default function VariantsCard({
  productId, variants, basePrice, onSaved,
}: { productId: string; variants: EditVariant[]; basePrice: number; onSaved: () => void }) {
  const [optionName, setOptionName] = useState(variants[0]?.options?.[0]?.name ?? "");
  const [rows, setRows] = useState<Row[]>(() => variants.map(toRow));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, field: keyof Row, value: string) => {
    setSaved(false);
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const validate = (): string => {
    if (rows.length === 0) return "";
    if (!optionName.trim()) return "اكتبي اسم الخاصية (مثل: المقاس أو الوزن)";
    const seen = new Set<string>();
    for (const r of rows) {
      const v = r.value.trim();
      if (!v) return "لكل متغيّر قيمة (مثل: M أو نصف كيلو)";
      if (seen.has(v.toLowerCase())) return `القيمة «${v}» مكرّرة`;
      seen.add(v.toLowerCase());
      const q = Number(r.quantity);
      if (r.quantity.trim() === "" || !Number.isInteger(q) || q < 0) return `كمية «${v}» يجب أن تكون رقماً صحيحاً (0 أو أكثر)`;
      if (r.price.trim() !== "" && !(Number(r.price) > 0)) return `سعر «${v}» غير صالح`;
    }
    return "";
  };

  const save = async () => {
    const problem = validate();
    if (problem) { setError(problem); return; }
    setSaving(true);
    setError("");
    try {
      const res = await api.post<{ variants: EditVariant[] }>(`/api/products/${productId}/variants`, {
        optionName: optionName.trim(),
        variants: rows.map((r) => ({
          id: r.id, value: r.value.trim(), price: r.price.trim() === "" ? null : Number(r.price),
          quantity: Number(r.quantity), sku: r.sku.trim() || null,
        })),
      });
      setRows(res.variants.map(toRow)); // ids الجديدة — حتى لا يُكرَّر الإنشاء عند الحفظ التالي
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ المتغيرات");
    } finally {
      setSaving(false);
    }
  };

  const total = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const bind = (key: string, field: keyof Row) => ({ value: rowsMap[key][field] as string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => update(key, field, e.target.value) });
  const rowsMap: Record<string, Row> = Object.fromEntries(rows.map((r) => [r.key, r]));

  return (
    <section className={s.panel} style={uiVars} aria-labelledby="pe-variants">
      <div className={s.panelHead}>
        <h2 id="pe-variants" className={s.panelTitle}>متغيرات المنتج (اختياري)</h2>
        <p className={s.panelSub}>للمنتجات ذات المقاسات أو الأوزان أو الأحجام. بدون متغيرات يبقى المنتج بسعره وكميته كما هما.</p>
      </div>
      <div className={s.panelBody}>
        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>اسم الخاصية — مثل: المقاس، الوزن، اللون</span>
          <input className={s.field} value={optionName} onChange={(e) => { setSaved(false); setOptionName(e.target.value); }} />
        </label>

        {rows.map((r) => (
          <div key={r.key} className={s.vrow}>
            <label className={s.fieldWrap}>
              <span className={s.fieldLabel}>القيمة (M / نصف كيلو)</span>
              <input className={s.field} {...bind(r.key, "value")} />
            </label>
            <label className={s.fieldWrap}>
              <span className={s.fieldLabel}>الكمية</span>
              <input className={`${s.field} ${s.ltr}`} type="number" min={0} {...bind(r.key, "quantity")} />
            </label>
            <label className={s.fieldWrap}>
              <span className={s.fieldLabel}>{`السعر (فارغ = ${basePrice})`}</span>
              <input className={`${s.field} ${s.ltr}`} type="number" min={0} {...bind(r.key, "price")} />
            </label>
            <label className={s.fieldWrap}>
              <span className={s.fieldLabel}>SKU (اختياري)</span>
              <input className={`${s.field} ${s.ltr}`} dir="ltr" {...bind(r.key, "sku")} />
            </label>
            <button type="button" className={s.vdel} onClick={() => { setSaved(false); setRows((rs) => rs.filter((x) => x.key !== r.key)); }}>
              <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
              حذف هذا المتغيّر
            </button>
          </div>
        ))}

        <button type="button" className={s.vadd} onClick={() => { setSaved(false); setRows((rs) => [...rs, blankRow()]); }}>
          <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
          إضافة متغيّر آخر
        </button>

        {rows.length > 0 && <p className={s.help}>إجمالي المخزون: {total} قطعة (يُحسب من المتغيرات)</p>}
        {error && (
          <p className={s.err} role="alert">
            <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
            {error}
          </p>
        )}
        {saved && (
          <p className={s.ok} role="status">
            <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden="true" />
            تم حفظ المتغيرات
          </p>
        )}
        <button type="button" className={s.cta} onClick={save} disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ المتغيرات"}
        </button>
      </div>
    </section>
  );
}
