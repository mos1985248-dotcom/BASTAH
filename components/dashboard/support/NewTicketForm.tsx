// components/dashboard/support/NewTicketForm.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

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
  const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, direction: "rtl" as const, boxSizing: "border-box" as const };

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["5"] }}>
      <h2 style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>طلب دعم جديد</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
        <div>
          <label style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: t.spacing["1"] }}>الموضوع</label>
          <input value={form.subject} onChange={(e) => onChange("subject", e.target.value)} placeholder="اكتبي موضوع مشكلتك..." style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: t.spacing["1"] }}>التصنيف</label>
          <select value={form.category} onChange={(e) => onChange("category", e.target.value)} style={inputStyle}>
            <option value="technical">مشكلة تقنية</option>
            <option value="billing">فوترة أو دفع</option>
            <option value="order">مشكلة طلب</option>
            <option value="other">أخرى</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: t.spacing["1"] }}>تفاصيل المشكلة</label>
          <textarea value={form.message} onChange={(e) => onChange("message", e.target.value)} rows={5} placeholder="اشرحي المشكلة بالتفصيل..." style={{ ...inputStyle, resize: "none" }} />
        </div>
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger }}>
            <AlertTriangle size={13} strokeWidth={1.8} />
            {error}
          </p>
        )}
        <button
          onClick={onSubmit}
          disabled={submitting}
          style={{ padding: 12, background: submitting ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.text.onDark, border: "none", borderRadius: t.radius.lg, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          {submitting ? "جاري الإرسال..." : "إرسال طلب الدعم"}
        </button>
      </div>
    </div>
  );
}
