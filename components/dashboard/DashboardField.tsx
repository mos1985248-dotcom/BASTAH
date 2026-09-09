// components/dashboard/DashboardField.tsx
import { t } from "@/theme";

export function DashboardField({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "block", direction: "rtl", textAlign: "right" }}>
      <span style={{ display: "block", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, marginBottom: t.spacing["1"], color: t.colors.text.dark }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: `1.5px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
          fontSize: t.typography.fontSize.base,
          background: t.colors.white,
          color: t.colors.text.dark,
          direction: type === "number" || type === "email" || type === "url" || type === "tel" ? "ltr" : "rtl",
          textAlign: type === "number" || type === "email" || type === "url" || type === "tel" ? "left" : "right",
          boxSizing: "border-box",
          outline: "none",
          transition: `border-color ${t.motion.fast} ${t.motion.ease}, box-shadow ${t.motion.fast} ${t.motion.ease}`,
          fontFamily: t.typography.fontFamily.base,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = t.colors.primary[600];
          e.currentTarget.style.boxShadow = `0 0 0 3px rgba(217, 119, 6, 0.15)`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = t.colors.cream.border;
          e.currentTarget.style.boxShadow = "none";
        }}
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
    <label style={{ display: "block", direction: "rtl", textAlign: "right" }}>
      <span style={{ display: "block", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, marginBottom: t.spacing["1"], color: t.colors.text.dark }}>
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: `1.5px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
          fontSize: t.typography.fontSize.base,
          background: t.colors.white,
          color: t.colors.text.dark,
          direction: "rtl",
          textAlign: "right",
          resize: "none",
          boxSizing: "border-box",
          outline: "none",
          fontFamily: t.typography.fontFamily.base,
          transition: `border-color ${t.motion.fast} ${t.motion.ease}, box-shadow ${t.motion.fast} ${t.motion.ease}`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = t.colors.primary[500];
          e.currentTarget.style.boxShadow = `0 0 0 3px rgba(217, 119, 6, 0.15)`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = t.colors.cream.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </label>
  );
}
