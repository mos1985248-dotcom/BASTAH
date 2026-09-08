// components/admin/ui/StatusBadge.tsx
import { t } from "@/theme";

export default function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 11px",
        borderRadius: t.radius.full,
        background: bg,
        color,
        fontSize: t.typography.fontSize.xs,
        fontWeight: t.typography.fontWeight.bold,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
