// components/admin/finance/PayoutForm.tsx — تسجيل دفعة لمندوب (تسجيل ومتابعة فقط؛ لا تحويل فعلي). مفتاح منع التكرار يتجدد بعد النجاح.
"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api-client";
import f from "@/components/dashboard/forms.module.css";
import { dateOnly, newKey, sar } from "./format";
import { F, inputClass, ltrClass, useSubmit } from "./forms";
import s from "./finance.module.css";

export default function PayoutForm({ courierId, outstandingMinor, onDone }: { courierId: string; outstandingMinor: number; onDone: () => void }) {
  const key = useRef(newKey());
  const [v, setV] = useState({ amount: "", settledAt: dateOnly(new Date()), method: "BANK_TRANSFER", reference: "", note: "" });
  const sub = useSubmit();
  const set = (k: keyof typeof v, val: string) => setV((p) => ({ ...p, [k]: val }));
  const over = Number(v.amount) * 100 > outstandingMinor + 0.5;

  const submit = async () => {
    const ok = await sub.run(() => api.post("/api/admin/finance/settlements", {
      kind: "COURIER_PAYOUT", partyType: "COURIER", partyRef: courierId, amount: v.amount, settledAt: v.settledAt,
      method: v.method || null, reference: v.reference || null, note: v.note || null, idempotencyKey: key.current,
    }), "تم تسجيل الدفعة");
    if (ok) { key.current = newKey(); setV((p) => ({ ...p, amount: "", reference: "", note: "" })); onDone(); }
  };

  return (
    <div className={f.formBox}>
      <h3 className={s.h2}>تسجيل دفعة للمندوب</h3>
      <p className={s.sub}>المتبقي المستحق له: {sar(outstandingMinor)}. لا يُسمح بتجاوزه؛ للتصحيح استعمل قيداً عكسياً من تبويب «التسويات».</p>
      <div className={s.formGrid}>
        <F label="مبلغ الدفعة (ر.س)"><input className={ltrClass} type="number" min={0} step="0.01" value={v.amount} onChange={(e) => set("amount", e.target.value)} dir="ltr" /></F>
        <F label="تاريخ الدفع"><input className={ltrClass} type="date" value={v.settledAt} onChange={(e) => set("settledAt", e.target.value)} dir="ltr" /></F>
        <F label="وسيلة الدفع"><select className={inputClass} value={v.method} onChange={(e) => set("method", e.target.value)}><option value="BANK_TRANSFER">تحويل بنكي</option><option value="CASH">نقداً</option><option value="OTHER">أخرى</option></select></F>
        <F label="الرقم المرجعي (اختياري)"><input className={ltrClass} value={v.reference} onChange={(e) => set("reference", e.target.value)} dir="ltr" /></F>
      </div>
      <F label="ملاحظة (اختياري)"><input className={inputClass} value={v.note} onChange={(e) => set("note", e.target.value)} /></F>
      {over && <p className={f.err}>المبلغ يتجاوز المتبقي المستحق وسيرفضه الخادم.</p>}
      {sub.error && <p className={f.err} role="alert">{sub.error}</p>}
      {sub.ok && <p className={s.ok}>{sub.ok}</p>}
      <button type="button" className={f.cta} disabled={sub.busy || !v.amount} onClick={submit}>{sub.busy ? "جاري التسجيل..." : "تسجيل الدفعة"}</button>
    </div>
  );
}
