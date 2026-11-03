// components/daftari/AddEntryForm.tsx
import { AlertTriangle, BookOpen } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import { EXPENSE_CATEGORY_LABEL } from "./types";
import s from "./daftari.module.css";

export interface EntryFormState {
  type: string;
  amount: string;
  expenseCategory: string;
  description: string;
}

export default function AddEntryForm({
  form, onChange, onSubmit, submitting, error,
}: {
  form: EntryFormState;
  onChange: (patch: Partial<EntryFormState>) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
}) {
  return (
    <section dir="rtl" className={s.panel} style={uiVars} aria-labelledby="add-entry-title">
      <div className={s.panelHead}>
        <BookOpen size={19} strokeWidth={1.7} aria-hidden="true" />
        <div>
          <h2 id="add-entry-title" className={s.panelTitle}>تسجيل قيد جديد</h2>
          <p className={s.panelSub}>أضف حركة مالية إلى دفاترك</p>
        </div>
      </div>
      <div className={s.panelBody}>
        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>نوع القيد</span>
          <select value={form.type} onChange={(e) => onChange({ type: e.target.value })} className={s.field}>
            <option value="SALE">بيع (دخل)</option>
            <option value="EXPENSE">مصروف</option>
            <option value="REFUND">استرداد</option>
            <option value="WITHDRAWAL">سحب أرباح</option>
            <option value="ADJUSTMENT">تعديل يدوي</option>
          </select>
        </label>

        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>المبلغ</span>
          <input type="number" min={0} value={form.amount} onChange={(e) => onChange({ amount: e.target.value })} placeholder="المبلغ (ر.س)" className={`${s.field} ${s.ltr}`} />
        </label>

        {form.type === "EXPENSE" && (
          <label className={s.fieldWrap}>
            <span className={s.fieldLabel}>تصنيف المصروف</span>
            <select value={form.expenseCategory} onChange={(e) => onChange({ expenseCategory: e.target.value })} className={s.field}>
              <option value="">تصنيف المصروف (اختياري)</option>
              {Object.entries(EXPENSE_CATEGORY_LABEL).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </label>
        )}

        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>الوصف</span>
          <input value={form.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="وصف مختصر (اختياري)" className={s.field} />
        </label>

        {error && (
          <p className={s.err} role="alert">
            <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
            {error}
          </p>
        )}

        <button type="button" onClick={onSubmit} disabled={submitting} className={s.cta}>
          {submitting ? "جاري الحفظ..." : "إضافة القيد"}
        </button>
      </div>
    </section>
  );
}
