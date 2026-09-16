// components/dashboard/DashboardField.tsx
import { t } from "@/theme";

const LTR_TYPES = new Set(["number", "email", "url", "tel"]);

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
  const isLTR = LTR_TYPES.has(type);

  return (
    <label
      style={{
        display: "block",
        width: "100%",
        direction: "rtl",
        textAlign: "right",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 7,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.text.dark,
          lineHeight: 1.5,
        }}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="basita-dashboard-field"
        style={{
          width: "100%",
          height: 48,
          padding: "0 14px",
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: 13,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.base,
          background: t.colors.cream.card,
          color: t.colors.text.dark,
          direction: isLTR ? "ltr" : "rtl",
          textAlign: isLTR ? "left" : "right",
          boxSizing: "border-box",
          outline: "none",
          transition:
            `border-color ${t.motion.fast} ${t.motion.ease}, ` +
            `box-shadow ${t.motion.fast} ${t.motion.ease}, ` +
            `background ${t.motion.fast} ${t.motion.ease}`,
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
    <label
      style={{
        display: "block",
        width: "100%",
        direction: "rtl",
        textAlign: "right",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 7,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.text.dark,
          lineHeight: 1.5,
        }}
      >
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="basita-dashboard-field basita-dashboard-textarea"
        style={{
          width: "100%",
          minHeight: 110,
          padding: "12px 14px",
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: 13,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.base,
          background: t.colors.cream.card,
          color: t.colors.text.dark,
          direction: "rtl",
          textAlign: "right",
          resize: "vertical",
          boxSizing: "border-box",
          outline: "none",
          lineHeight: t.typography.lineHeight.relaxed,
          transition:
            `border-color ${t.motion.fast} ${t.motion.ease}, ` +
            `box-shadow ${t.motion.fast} ${t.motion.ease}, ` +
            `background ${t.motion.fast} ${t.motion.ease}`,
        }}
      />
    </label>
  );
}