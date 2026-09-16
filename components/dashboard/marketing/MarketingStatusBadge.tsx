// components/dashboard/marketing/MarketingStatusBadge.tsx

import { t } from "@/theme";

const STATUS_STYLE: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
  }
> = {
  DRAFT: {
    label: "مسودة",
    color: t.colors.semantic.warning,
    bg: t.colors.semantic.warningBg,
  },

  PENDING_CONNECTION: {
    label: "بانتظار الربط",
    color: t.colors.text.mid,
    bg: t.colors.cream.warm,
  },

  PUBLISHED: {
    label: "منشور",
    color: t.colors.semantic.success,
    bg: t.colors.semantic.successBg,
  },

  FAILED: {
    label: "فشل النشر",
    color: t.colors.semantic.danger,
    bg: t.colors.semantic.dangerBg,
  },
};

export default function MarketingStatusBadge({
  status,
}: {
  status: string;
}) {
  const current = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        minHeight: 26,
        padding: "4px 10px",
        borderRadius: t.radius.full,
        background: current.bg,
        color: current.color,
        fontSize: t.typography.fontSize.xs,
        fontWeight: t.typography.fontWeight.bold,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {current.label}
    </span>
  );
}