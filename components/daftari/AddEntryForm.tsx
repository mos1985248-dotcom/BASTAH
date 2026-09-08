// components/daftari/AddEntryForm.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import { EXPENSE_CATEGORY_LABEL } from "./types";

export interface EntryFormState {
  type: string; amount: string; expenseCategory: string; description: string;
}

export default function AddEntryForm({
  form, onChange, onSubmit, submitting, error,
}: {
  form: EntryFormState; onChange: (patch: Partial<EntryFormState>) => void;
  onSubmit: () => void; submitting: boolean; error: string;
}) {
  const inputStyle: React.CSSProperties = { padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, direction: "rtl", boxSizing: "border-box" };

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"], display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>تسجيل قيد جديد</h3>

      <select value={form.type} onChange={(e) => onChange({ type: e.target.value })} style={inputStyle}>
        <option value="SALE">بيع (دخل)</option>
        <option value="EXPENSE">مصروف</option>
        <option value="REFUND">استرداد</option>
        <option value="WITHDRAWAL">سحب أرباح</option>
        <option value="ADJUSTMENT">تعديل يدوي</option>
      </select>

      <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => onChange({ amount: e.target.value })} placeholder="المبلغ (ر.س)" style={{ ...inputStyle, direction: "ltr" }} />

      {form.type === "EXPENSE" && (
        <select value={form.expenseCategory} onChange={(e) => onChange({ expenseCategory: e.target.value })} style={inputStyle}>
          <option value="">تصنيف المصروف (اختياري)</option>
          {Object.entries(EXPENSE_CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      )}

      <input value={form.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="وصف مختصر (اختياري)" style={inputStyle} />

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
          {error}
        </p>
      )}

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="basita-btn-interactive"
        style={{ padding: 10, background: submitting ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontWeight: t.typography.fontWeight.bold, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "جاري الحفظ..." : "+ إضافة القيد"}
      </button>
    </div>
  );
}
