// components/auth/AuthField.tsx
// حقل إدخال موحّد لنماذج المصادقة — كل القيم من theme/.
import { t } from "@/theme";

export default function AuthField({
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.semibold,
          color: t.colors.text.dark,
          marginBottom: t.spacing["1"],
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: `1.5px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
          fontSize: t.typography.fontSize.base,
          direction: "rtl",
          outline: "none",
          background: t.colors.white,
          color: t.colors.text.dark,
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = t.colors.primary[600])}
        onBlur={(e) => (e.currentTarget.style.borderColor = t.colors.cream.border)}
      />
    </label>
  );
}
