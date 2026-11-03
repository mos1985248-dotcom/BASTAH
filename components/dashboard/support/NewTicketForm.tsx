// components/dashboard/support/NewTicketForm.tsx
import { AlertTriangle } from "lucide-react";
import f from "../forms.module.css";
import s from "./support.module.css";

interface TicketForm { subject: string; category: string; message: string; }

export default function NewTicketForm({
  form,
  onChange,
  error,
  submitting,
  onSubmit,
}: {
  form: TicketForm;
  onChange: (k: keyof TicketForm, v: string) => void;
  error: string;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <section className={`${f.panel} ${s.pad}`}>
      <h2 className={s.formTitle}>طلب دعم جديد</h2>
      <div className={s.form}>
        <label className={f.fieldWrap}>
          <span className={f.fieldLabel}>الموضوع</span>
          <input value={form.subject} onChange={(e) => onChange("subject", e.target.value)} placeholder="اكتب موضوع مشكلتك..." className={f.field} />
        </label>
        <label className={f.fieldWrap}>
          <span className={f.fieldLabel}>التصنيف</span>
          <select value={form.category} onChange={(e) => onChange("category", e.target.value)} className={`${f.field} ${s.select}`}>
            <option value="technical">مشكلة تقنية</option>
            <option value="billing">فوترة أو دفع</option>
            <option value="order">مشكلة طلب</option>
            <option value="other">أخرى</option>
          </select>
        </label>
        <label className={f.fieldWrap}>
          <span className={f.fieldLabel}>تفاصيل المشكلة</span>
          <textarea value={form.message} onChange={(e) => onChange("message", e.target.value)} rows={5} placeholder="اشرح المشكلة بالتفصيل..." className={`${f.field} ${f.area} ${s.noResize}`} />
        </label>
        {error && (
          <p className={f.err} role="alert">
            <AlertTriangle size={15} strokeWidth={1.8} />
            {error}
          </p>
        )}
        <button type="button" onClick={onSubmit} disabled={submitting} className={`${f.cta} ${s.submit}`}>
          {submitting ? "جاري الإرسال..." : "إرسال طلب الدعم"}
        </button>
      </div>
    </section>
  );
}
