// components/dashboard/product-edit/VariantsCard.tsx
// متغيرات المنتج (اختيارية): اسم الخاصية نص حر (المقاس، الوزن، اللون...) + صفوف قيمة/سعر/كمية/SKU.
// منتج بدون صفوف يبقى كما هو تماماً — الكمية الكلية تُحسب من المتغيرات على السيرفر.
"use client";

import { useState } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

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

const inputStyle = {
  padding: 9, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md,
  fontSize: t.typography.fontSize.sm, boxSizing: "border-box" as const, width: "100%", minWidth: 0,
};

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
  const small = { margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid } as const;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["5"], marginBottom: t.spacing["4"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>متغيرات المنتج (اختياري)</h3>
      <p style={{ ...small, marginBottom: t.spacing["3"] }}>
        للمنتجات ذات المقاسات أو الأوزان أو الأحجام. بدون متغيرات يبقى المنتج بسعره وكميته كما هما.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        <input value={optionName} onChange={(e) => { setSaved(false); setOptionName(e.target.value); }} placeholder="اسم الخاصية — مثل: المقاس، الوزن، اللون" style={{ ...inputStyle, direction: "rtl" }} />

        {rows.map((r) => (
          <div key={r.key} style={{ border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: t.spacing["2"], display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["2"] }}>
            <input value={r.value} onChange={(e) => update(r.key, "value", e.target.value)} placeholder="القيمة (M / نصف كيلو)" style={{ ...inputStyle, direction: "rtl" }} />
            <input type="number" min={0} value={r.quantity} onChange={(e) => update(r.key, "quantity", e.target.value)} placeholder="الكمية" style={inputStyle} />
            <input type="number" min={0} value={r.price} onChange={(e) => update(r.key, "price", e.target.value)} placeholder={`السعر (فارغ = ${basePrice})`} style={inputStyle} />
            <input value={r.sku} onChange={(e) => update(r.key, "sku", e.target.value)} placeholder="SKU (اختياري)" dir="ltr" style={inputStyle} />
            <button
              type="button" onClick={() => { setSaved(false); setRows((rs) => rs.filter((x) => x.key !== r.key)); }}
              style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 6, background: "transparent", border: "none", color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs, cursor: "pointer" }}
            >
              <Trash2 size={13} strokeWidth={1.8} />
              حذف هذا المتغيّر
            </button>
          </div>
        ))}

        <button
          type="button" onClick={() => { setSaved(false); setRows((rs) => [...rs, blankRow()]); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, background: t.colors.primary[100], border: "none", borderRadius: t.radius.md, color: t.colors.primary[800], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
        >
          <Plus size={14} strokeWidth={2.2} />
          إضافة متغيّر آخر
        </button>

        {rows.length > 0 && <p style={small}>إجمالي المخزون: {total} قطعة (يُحسب من المتغيرات)</p>}

        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger }}>
            <AlertTriangle size={13} strokeWidth={1.8} />
            {error}
          </p>
        )}
        {saved && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.success }}>
            <CheckCircle2 size={13} strokeWidth={1.8} />
            تم حفظ المتغيرات
          </p>
        )}

        <button
          type="button" onClick={save} disabled={saving}
          style={{ padding: 12, background: saving ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.text.onDark, border: "none", borderRadius: t.radius.lg, fontWeight: t.typography.fontWeight.bold, cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "جاري الحفظ..." : "حفظ المتغيرات"}
        </button>
      </div>
    </div>
  );
}
