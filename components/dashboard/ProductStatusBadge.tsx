// components/dashboard/ProductStatusBadge.tsx
import { CheckCircle2, Clock3, AlertCircle, Archive } from "lucide-react";
import { t } from "@/theme";

const STATUS_STYLE: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    Icon: typeof CheckCircle2;
  }
> = {
  ACTIVE: {
    label: "نشط",
    color: t.colors.semantic.success,
    bg: t.colors.semantic.successBg,
    Icon: CheckCircle2,
  },

  DRAFT: {
    label: "مسودة",
    color: t.colors.semantic.warning,
    bg: t.colors.semantic.warningBg,
    Icon: Clock3,
  },

  OUT_OF_STOCK: {
    label: "نفدت الكمية",
    color: t.colors.semantic.danger,
    bg: t.colors.semantic.dangerBg,
    Icon: AlertCircle,
  },

  ARCHIVED: {
    label: "مؤرشف",
    color: t.colors.text.light,
    bg: t.colors.cream.bg,
    Icon: Archive,
  },
};

export default function ProductStatusBadge({
  status,
}: {
  status: string;
}) {
  const current =
    STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;

  const StatusIcon = current.Icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 26,
        padding: "0 9px",
        borderRadius: t.radius.full,
        background: current.bg,
        color: current.color,
        fontFamily: t.typography.fontFamily.base,
        fontSize: t.typography.fontSize.xs,
        fontWeight: t.typography.fontWeight.bold,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        flexShrink: 0,
        direction: "rtl",
      }}
    >
      <StatusIcon
        size={13}
        strokeWidth={2}
        style={{ flexShrink: 0 }}
      />

      {current.label}
    </span>
  );
}