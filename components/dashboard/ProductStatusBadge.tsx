// components/dashboard/ProductStatusBadge.tsx
import { t } from "@/theme";

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "نشط", color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  DRAFT: { label: "مسودة", color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  OUT_OF_STOCK: { label: "نفدت الكمية", color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  ARCHIVED: { label: "مؤرشف", color: t.colors.text.light, bg: t.colors.cream.bg },
};

export default function ProductStatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: t.typography.fontSize.xs,
        padding: "3px 10px",
        borderRadius: t.radius.full,
        background: s.bg,
        color: s.color,
        fontWeight: t.typography.fontWeight.bold,
        flexShrink: 0,
        direction: "rtl",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: t.radius.full, background: s.color }} />
      {s.label}
    </span>
  );
}