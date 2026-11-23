// components/admin/finance/SettlementsTab.tsx — سجل التسويات (تحصيلات بسطة ودفعات المناديب) + استردادات الاشتراكات.
// تسجيل ومتابعة فقط. التصحيح بقيد عكسي موثَّق؛ لا حذف.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import LoadingState from "@/components/admin/ui/LoadingState";
import f from "@/components/dashboard/forms.module.css";
import { dateOnly, newKey, sar } from "./format";
import { F, inputClass, ltrClass, useSubmit } from "./forms";
import s from "./finance.module.css";

interface Settlement { id: string; kind: string; partyType: string; partyRef: string; amountMinor: number; settledAt: string; isReversal: boolean; reference: string | null; method: string | null; note: string | null; reversalOfId: string | null }
interface InvoiceRow { id: string; store: string; plan: string; cycle: string; amountMinor: number; vatMinor: number | null; paidAt: string; refundedMinor: number }
const KIND: Record<string, string> = { COURIER_PAYOUT: "دفعة مندوب", COMMISSION_RECEIPT: "تحصيل عمولة شحن", LOCAL_DELIVERY_RECEIPT: "تحصيل توصيل بسطة", COD_SHARE_RECEIPT: "تحصيل حصة COD" };

function ReceiptForm({ onDone }: { onDone: () => void }) {
  const key = useRef(newKey());
  const [v, setV] = useState({ kind: "COMMISSION_RECEIPT", partyType: "MERCHANT", partyRef: "", amount: "", settledAt: dateOnly(new Date()), method: "BANK_TRANSFER", reference: "", note: "" });
  const sub = useSubmit();
  const set = (k: keyof typeof v, val: string) => setV((p) => ({ ...p, [k]: val }));
  const submit = async () => {
    const ok = await sub.run(() => api.post("/api/admin/finance/settlements", { ...v, method: v.method || null, reference: v.reference || null, note: v.note || null, idempotencyKey: key.current }), "تم تسجيل التحصيل");
    if (ok) { key.current = newKey(); setV((p) => ({ ...p, amount: "", reference: "", note: "" })); onDone(); }
  };
  return (
    <div className={f.formBox}>
      <h3 className={s.h2}>تسجيل تحصيل لبسطة</h3>
      <p className={s.sub}>سجّل ما استلمته بسطة فعلاً من الطرف المدين. لا يتجاوز المبلغ المستحق المحسوب من الشحنات، ويُربط تلقائياً بالأقدم أولاً.</p>
      <div className={s.formGrid}>
        <F label="النوع"><select className={inputClass} value={v.kind} onChange={(e) => { set("kind", e.target.value); if (e.target.value !== "COD_SHARE_RECEIPT") set("partyType", "MERCHANT"); }}><option value="COMMISSION_RECEIPT">عمولة الشحن الخارجي</option><option value="LOCAL_DELIVERY_RECEIPT">قيمة توصيل بسطة للشحن</option><option value="COD_SHARE_RECEIPT">حصة بسطة من COD</option></select></F>
        <F label="الطرف"><select className={inputClass} value={v.partyType} onChange={(e) => set("partyType", e.target.value)}><option value="MERCHANT">تاجر (معرّف المتجر)</option>{v.kind === "COD_SHARE_RECEIPT" && <option value="CARRIER">ناقل (رمزه)</option>}</select></F>
        <F label={v.partyType === "MERCHANT" ? "معرّف المتجر (storeId)" : "رمز الناقل"}><input className={ltrClass} value={v.partyRef} onChange={(e) => set("partyRef", e.target.value)} dir="ltr" /></F>
        <F label="المبلغ (ر.س)"><input className={ltrClass} type="number" min={0} step="0.01" value={v.amount} onChange={(e) => set("amount", e.target.value)} dir="ltr" /></F>
        <F label="تاريخ الاستلام"><input className={ltrClass} type="date" value={v.settledAt} onChange={(e) => set("settledAt", e.target.value)} dir="ltr" /></F>
        <F label="المرجع (اختياري)"><input className={ltrClass} value={v.reference} onChange={(e) => set("reference", e.target.value)} dir="ltr" /></F>
      </div>
      <F label="ملاحظة (اختياري)"><input className={inputClass} value={v.note} onChange={(e) => set("note", e.target.value)} /></F>
      {sub.error && <p className={f.err} role="alert">{sub.error}</p>}
      {sub.ok && <p className={s.ok}>{sub.ok}</p>}
      <button type="button" className={f.cta} disabled={sub.busy || !v.amount || !v.partyRef} onClick={submit}>{sub.busy ? "جاري التسجيل..." : "تسجيل التحصيل"}</button>
    </div>
  );
}

function RefundForm({ year, month, onDone }: { year: number; month: number; onDone: () => void }) {
  const key = useRef(newKey());
  const [invoices, setInvoices] = useState<InvoiceRow[] | null>(null);
  const [v, setV] = useState({ invoiceId: "", amount: "", refundedAt: dateOnly(new Date()), reference: "", note: "" });
  const sub = useSubmit();
  const load = useCallback(() => { api.get<{ invoices: InvoiceRow[] }>(`/api/admin/finance/invoices?year=${year}&month=${month}`).then((r) => setInvoices(r.invoices)).catch(() => setInvoices([])); }, [year, month]);
  useEffect(load, [load]);
  const chosen = invoices?.find((i) => i.id === v.invoiceId);
  const submit = async () => {
    const ok = await sub.run(() => api.post("/api/admin/finance/refunds", { ...v, reference: v.reference || null, note: v.note || null, idempotencyKey: key.current }), "تم تسجيل الاسترداد");
    if (ok) { key.current = newKey(); setV((p) => ({ ...p, amount: "", reference: "", note: "" })); load(); onDone(); }
  };
  return (
    <div className={f.formBox}>
      <h3 className={s.h2}>تسجيل استرداد اشتراك</h3>
      <p className={s.sub}>الاسترداد الجزئي أو الكامل حدث مالي موثّق يظهر في شهر حدوثه، ولا يتجاوز المدفوع المتبقي. تغيير حالة الفاتورة وحده لا يُعدّ خروج مال. الخصومات غير مدعومة حالياً.</p>
      <div className={s.formGrid}>
        <F label={`فاتورة مدفوعة في الشهر${invoices ? ` (${invoices.length})` : ""}`}>
          <select className={inputClass} value={v.invoiceId} onChange={(e) => setV((p) => ({ ...p, invoiceId: e.target.value }))}>
            <option value="">اختر فاتورة</option>{(invoices ?? []).map((i) => <option key={i.id} value={i.id}>{i.store} — {i.plan} — {sar(i.amountMinor)}{i.refundedMinor ? ` (مسترد ${sar(i.refundedMinor)})` : ""}</option>)}
          </select>
        </F>
        <F label="مبلغ الاسترداد (ر.س)" hint={chosen ? `المتبقي القابل للاسترداد ${sar(chosen.amountMinor - chosen.refundedMinor)}` : undefined}><input className={ltrClass} type="number" min={0} step="0.01" value={v.amount} onChange={(e) => setV((p) => ({ ...p, amount: e.target.value }))} dir="ltr" /></F>
        <F label="تاريخ الاسترداد"><input className={ltrClass} type="date" value={v.refundedAt} onChange={(e) => setV((p) => ({ ...p, refundedAt: e.target.value }))} dir="ltr" /></F>
        <F label="المرجع (اختياري)"><input className={ltrClass} value={v.reference} onChange={(e) => setV((p) => ({ ...p, reference: e.target.value }))} dir="ltr" /></F>
      </div>
      {sub.error && <p className={f.err} role="alert">{sub.error}</p>}
      {sub.ok && <p className={s.ok}>{sub.ok}</p>}
      <button type="button" className={f.cta} disabled={sub.busy || !v.invoiceId || !v.amount} onClick={submit}>{sub.busy ? "جاري التسجيل..." : "تسجيل الاسترداد"}</button>
    </div>
  );
}

export default function SettlementsTab({ year, month, onChanged }: { year: number; month: number; onChanged: () => void }) {
  const [rows, setRows] = useState<Settlement[] | null>(null);
  const [error, setError] = useState("");
  const [reversing, setReversing] = useState<Settlement | null>(null);
  const [actionError, setActionError] = useState("");
  const load = useCallback(() => { setError(""); api.get<{ settlements: Settlement[] }>(`/api/admin/finance/settlements?year=${year}&month=${month}`).then((r) => setRows(r.settlements)).catch((e) => setError(e instanceof ApiError ? e.message : "تعذّر التحميل")); }, [year, month]);
  useEffect(load, [load]);
  const done = () => { load(); onChanged(); };
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <LoadingState label="جاري تحميل التسويات..." />;
  const reversed = new Set(rows.filter((r) => r.reversalOfId).map((r) => r.reversalOfId));
  return (
    <div className={s.root}>
      <div className={s.card}>
        <h2 className={s.h2}>سجل تسويات الشهر</h2>
        <p className={s.sub}>تسجيل ومتابعة فقط — لا تحويلات مالية فعلية. التصحيح بقيد عكسي يبقي الأصل ظاهراً.</p>
        {actionError && <p className={f.err} role="alert">{actionError}</p>}
        {rows.length === 0 ? <EmptyState message="لا تسويات مسجّلة لهذا الشهر" /> : (
          <div className={s.scroll}><table className={s.table}>
            <thead><tr><th>التاريخ</th><th>النوع</th><th>الطرف</th><th>المبلغ</th><th>المرجع</th><th>ملاحظة</th><th /></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id}><td className={s.num}>{dateOnly(r.settledAt)}</td><td>{KIND[r.kind] ?? r.kind}{r.isReversal && " (عكسي)"}</td><td className={s.num}>{r.partyType}: {r.partyRef.slice(0, 10)}</td>
                <td className={`${s.num} ${r.isReversal ? s.neg : ""}`}>{sar(r.isReversal ? -r.amountMinor : r.amountMinor)}</td><td>{r.reference ?? "—"}</td><td>{r.note ?? ""}</td>
                <td>{!r.isReversal && !reversed.has(r.id) && <button type="button" className={`${f.btnSm} ${f.btnDanger}`} onClick={() => setReversing(r)}>عكس</button>}{!r.isReversal && reversed.has(r.id) && <span className={s.muted}>مُصحَّحة</span>}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      <div className={s.grid2}><ReceiptForm onDone={done} /><RefundForm year={year} month={month} onDone={done} /></div>
      <ConfirmDialog open={!!reversing} title="عكس التسوية؟" body="يُنشأ قيد عكسي موثَّق يعيد الرصيد لما قبل التسوية، ويبقى الأصل ظاهراً في السجل." confirmLabel="تأكيد العكس" danger requireReason onCancel={() => setReversing(null)}
        onConfirm={async (reason) => { try { await api.post(`/api/admin/finance/settlements/${reversing!.id}/reverse`, { reason }); setReversing(null); setActionError(""); done(); } catch (e) { setActionError(e instanceof ApiError ? e.message : "تعذّر العكس"); setReversing(null); } }} />
    </div>
  );
}
