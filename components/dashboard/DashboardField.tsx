// components/dashboard/DashboardField.tsx
// حقول نماذج اللوحة (مشتركة: إضافة منتج، إنشاء متجر). التنسيق من forms.module.css.
import { uiVars } from "@/components/ui/vars";
import s from "./forms.module.css";

const LTR_TYPES = new Set(["number", "email", "url", "tel"]);

export function DashboardField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const isLTR = LTR_TYPES.has(type);
  return (
    <label className={s.fieldWrap} style={uiVars}>
      <span className={s.fieldLabel}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${s.field} ${isLTR ? s.ltr : ""}`}
      />
    </label>
  );
}

export function DashboardTextarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className={s.fieldWrap} style={uiVars}>
      <span className={s.fieldLabel}>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${s.field} ${s.area}`} />
    </label>
  );
}
