// components/admin/finance/ExpenseForm.tsx — إضافة مصروف أو تعديله (التعديل يتطلب سبباً ويُوثَّق بالتدقيق).
"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import f from "@/components/dashboard/forms.module.css";
import { dateOnly } from "./format";
import { F, inputClass, ltrClass, useSubmit } from "./forms";
import s from "./finance.module.css";

export interface ExpenseRow {
  id: string; category: "ESTABLISHMENT" | "OPERATIONS" | "AI" | "SALARIES"; description: string; amount: string; vatAmount: string | null;
  expenseDate: string; paidAt: string | null; status: "PAID" | "UNPAID"; kind: "FIXED" | "VARIABLE"; reference: string | null; note: string | null; voidedAt: string | null;
}

export const CATEGORY_LABEL = { ESTABLISHMENT: "تأسيس", OPERATIONS: "تشغيل", AI: "ذكاء اصطناعي (يدوي)", SALARIES: "رواتب" } as const;

export default function ExpenseForm({ initial, defaultDate, onDone, onCancel }: { initial?: ExpenseRow; defaultDate: string; onDone: () => void; onCancel: () => void }) {
  const [v, setV] = useState({
    category: initial?.category ?? "OPERATIONS", kind: initial?.kind ?? "FIXED", description: initial?.description ?? "", amount: initial ? String(Number(initial.amount)) : "",
    vatAmount: initial?.vatAmount ? String(Number(initial.vatAmount)) : "", expenseDate: initial ? dateOnly(initial.expenseDate) : defaultDate, status: initial?.status ?? "UNPAID",
    paidAt: initial?.paidAt ? dateOnly(initial.paidAt) : "", reference: initial?.reference ?? "", note: initial?.note ?? "", reason: "",
  });
  const sub = useSubmit();
  const set = (k: keyof typeof v, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = async () => {
    const body = {
      category: v.category, kind: v.kind, description: v.description, amount: v.amount, vatAmount: v.vatAmount === "" ? null : v.vatAmount,
      expenseDate: v.expenseDate, status: v.status, paidAt: v.status === "PAID" ? v.paidAt || null : null, reference: v.reference || null, note: v.note || null,
    };
    const done = await sub.run(() => (initial ? api.patch(`/api/admin/finance/expenses/${initial.id}`, { ...body, reason: v.reason }) : api.post("/api/admin/finance/expenses", body)), initial ? "تم التعديل" : "تمت الإضافة");
    if (done) onDone();
  };

  return (
    <div className={f.formBox}>
      <div className={s.formGrid}>
        <F label="التصنيف"><select className={inputClass} value={v.category} onChange={(e) => set("category", e.target.value)}>{Object.entries(CATEGORY_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></F>
        <F label="النوع"><select className={inputClass} value={v.kind} onChange={(e) => set("kind", e.target.value)}><option value="FIXED">ثابت</option><option value="VARIABLE">متغير</option></select></F>
        <F label="المبلغ (ر.س)"><input className={ltrClass} type="number" min={0} step="0.01" value={v.amount} onChange={(e) => set("amount", e.target.value)} dir="ltr" /></F>
        <F label="الضريبة (اختياري)" hint="للتوثيق فقط؛ لا استرداد ضريبي تلقائي"><input className={ltrClass} type="number" min={0} step="0.01" value={v.vatAmount} onChange={(e) => set("vatAmount", e.target.value)} dir="ltr" /></F>
        <F label="تاريخ المصروف"><input className={ltrClass} type="date" value={v.expenseDate} onChange={(e) => set("expenseDate", e.target.value)} dir="ltr" /></F>
        <F label="الحالة"><select className={inputClass} value={v.status} onChange={(e) => set("status", e.target.value)}><option value="UNPAID">غير مدفوع</option><option value="PAID">مدفوع</option></select></F>
        {v.status === "PAID" && <F label="تاريخ الدفع"><input className={ltrClass} type="date" value={v.paidAt} onChange={(e) => set("paidAt", e.target.value)} dir="ltr" /></F>}
        <F label="المرجع (اختياري)"><input className={inputClass} value={v.reference} onChange={(e) => set("reference", e.target.value)} /></F>
      </div>
      <F label="الوصف"><input className={inputClass} value={v.description} onChange={(e) => set("description", e.target.value)} /></F>
      <F label="ملاحظة (اختياري)"><input className={inputClass} value={v.note} onChange={(e) => set("note", e.target.value)} /></F>
      {initial && <F label="سبب التعديل (يُحفظ في سجل التدقيق)"><input className={inputClass} value={v.reason} onChange={(e) => set("reason", e.target.value)} /></F>}
      {sub.error && <p className={f.err} role="alert">{sub.error}</p>}
      <div className={s.formRow}>
        <button type="button" className={f.cta} disabled={sub.busy} onClick={submit}>{sub.busy ? "جاري الحفظ..." : initial ? "حفظ التعديل" : "إضافة المصروف"}</button>
        <button type="button" className={`${f.cta} ${f.ghost}`} onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}
