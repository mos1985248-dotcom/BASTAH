// components/admin/finance/ExpensesTab.tsx — مصروفات الشهر: جدول + إضافة + تعديل موثَّق + إلغاء ناعم. التأسيس منفصل عن التشغيل.
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import LoadingState from "@/components/admin/ui/LoadingState";
import f from "@/components/dashboard/forms.module.css";
import ExpenseForm, { CATEGORY_LABEL, type ExpenseRow } from "./ExpenseForm";
import { dateOnly, sar } from "./format";
import s from "./finance.module.css";

export default function ExpensesTab({ year, month, onChanged }: { year: number; month: number; onChanged: () => void }) {
  const [rows, setRows] = useState<ExpenseRow[] | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [voiding, setVoiding] = useState<ExpenseRow | null>(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    setError("");
    api.get<{ expenses: ExpenseRow[] }>(`/api/admin/finance/expenses?year=${year}&month=${month}`).then((r) => setRows(r.expenses)).catch((e) => setError(e instanceof ApiError ? e.message : "تعذّر التحميل"));
  }, [year, month]);
  useEffect(load, [load]);
  const done = () => { setAdding(false); setEditing(null); load(); onChanged(); };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <LoadingState label="جاري تحميل المصروفات..." />;
  const live = rows.filter((r) => !r.voidedAt);
  const total = (pred: (r: ExpenseRow) => boolean) => live.filter(pred).reduce((a, r) => a + Math.round(Number(r.amount) * 100), 0);
  const defaultDate = dateOnly(new Date(Date.UTC(year, month - 1, 15)));

  return (
    <div className={s.root}>
      <div className={s.split}>
        <div><h2 className={s.h2}>مصروفات الشهر</h2>
          <p className={s.sub}>التشغيل: {sar(total((r) => r.category !== "ESTABLISHMENT"))} — التأسيس (منفصل عن التشغيل): {sar(total((r) => r.category === "ESTABLISHMENT"))} — غير المدفوع لا يدخل التدفق النقدي.</p></div>
        {!adding && !editing && <button type="button" className={`${f.btnSm} ${f.btnPrimary}`} onClick={() => setAdding(true)}><Plus size={15} strokeWidth={2.2} />إضافة مصروف</button>}
      </div>
      {adding && <ExpenseForm defaultDate={defaultDate} onDone={done} onCancel={() => setAdding(false)} />}
      {editing && <ExpenseForm initial={editing} defaultDate={defaultDate} onDone={done} onCancel={() => setEditing(null)} />}
      {actionError && <p className={f.err} role="alert">{actionError}</p>}
      {rows.length === 0 ? <EmptyState message="لا مصروفات مسجّلة لهذا الشهر" /> : (
        <div className={s.scroll}>
          <table className={s.table}>
            <thead><tr><th>التاريخ</th><th>التصنيف</th><th>الوصف</th><th>المبلغ</th><th>النوع</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className={r.voidedAt ? s.dim : undefined}>
                <td className={s.num}>{dateOnly(r.expenseDate)}</td><td>{CATEGORY_LABEL[r.category]}</td>
                <td>{r.description}{r.voidedAt && <div className={s.muted}>مُلغى</div>}</td>
                <td className={s.num}>{sar(Math.round(Number(r.amount) * 100))}</td>
                <td>{r.kind === "FIXED" ? "ثابت" : "متغير"}</td><td>{r.status === "PAID" ? `مدفوع ${r.paidAt ? dateOnly(r.paidAt) : ""}` : "غير مدفوع"}</td>
                <td>{!r.voidedAt && <div className={s.formRow}><button type="button" className={f.btnSm} onClick={() => setEditing(r)}>تعديل</button><button type="button" className={`${f.btnSm} ${f.btnDanger}`} onClick={() => setVoiding(r)}>إلغاء</button></div>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!voiding} title="إلغاء المصروف؟" body="يبقى السجل ظاهراً كمُلغى ولا يدخل الحسابات، ويُوثَّق السبب في سجل التدقيق." confirmLabel="إلغاء المصروف" danger requireReason
        onCancel={() => setVoiding(null)}
        onConfirm={async (reason) => {
          try { await api.post(`/api/admin/finance/expenses/${voiding!.id}/void`, { reason }); setVoiding(null); done(); }
          catch (e) { setActionError(e instanceof ApiError ? e.message : "تعذّر الإلغاء"); setVoiding(null); }
        }} />
    </div>
  );
}
