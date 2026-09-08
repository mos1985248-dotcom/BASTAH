// components/dashboard/marketing/MarketingStatusBadge.tsx
import { t } from "@/theme";

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "مسودة", color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  PENDING_CONNECTION: { label: "بانتظار الربط", color: t.colors.text.mid, bg: t.colors.cream.bg },
  PUBLISHED: { label: "منشور", color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  FAILED: { label: "فشل النشر", color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
};

export default function MarketingStatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;
  return (
    <span style={{ fontSize: t.typography.fontSize.xs, padding: "3px 10px", borderRadius: t.radius.full, background: s.bg, color: s.color, fontWeight: t.typography.fontWeight.bold, flexShrink: 0 }}>
      {s.label}
    </span>
  );
}
