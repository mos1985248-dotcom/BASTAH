// components/dashboard/DashboardHeader.tsx
import { ExternalLink, CircleCheck, AlertTriangle } from "lucide-react";
import { t } from "@/theme";

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string; Icon: typeof CircleCheck }
> = {
  ACTIVE: {
    label: "نشط",
    color: t.colors.semantic.success,
    bg: t.colors.semantic.successBg,
    Icon: CircleCheck,
  },

  TRIAL: {
    label: "تجريبي",
    color: t.colors.semantic.success,
    bg: t.colors.semantic.successBg,
    Icon: CircleCheck,
  },

  GRACE_PERIOD: {
    label: "فترة سماح — الاشتراك منتهٍ",
    color: t.colors.gold[600],
    bg: t.colors.gold[100],
    Icon: AlertTriangle,
  },

  SUSPENDED: {
    label: "معلّق — المنتجات غير ظاهرة",
    color: t.colors.semantic.danger,
    bg: t.colors.semantic.dangerBg,
    Icon: AlertTriangle,
  },

  EXPIRED: {
    label: "منتهي",
    color: t.colors.semantic.danger,
    bg: t.colors.semantic.dangerBg,
    Icon: AlertTriangle,
  },

  CANCELLED: {
    label: "مُلغى",
    color: t.colors.text.light,
    bg: t.colors.cream.warm,
    Icon: AlertTriangle,
  },
};

export default function DashboardHeader({
  storeName,
  storeSlug,
  subscriptionStatus,
}: {
  storeName: string;
  storeSlug: string;
  subscriptionStatus?: string;
}) {
  const status =
    STATUS_LABELS[subscriptionStatus ?? "ACTIVE"] ??
    STATUS_LABELS.ACTIVE;

  const needsAttention =
    subscriptionStatus === "GRACE_PERIOD" ||
    subscriptionStatus === "SUSPENDED" ||
    subscriptionStatus === "EXPIRED";

  const StatusIcon = status.Icon;

  return (
    <div
      className="basita-dashboard-header"
      style={{
        background: t.colors.white,
        borderBottom: `1px solid ${t.colors.cream.border}`,
        padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: t.spacing["4"],
        direction: "rtl",
      }}
    >
      {/* اسم المتجر والحالة */}
      <div
        style={{
          minWidth: 0,
          flex: "1 1 auto",
        }}
      >
        <h1
          style={{
            margin: "0 0 7px",
            fontFamily: t.typography.fontFamily.heading,
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.35,
            color: t.colors.primary[800],
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {storeName}
        </h1>

        <a
          href="/dashboard/subscription"
          className="basita-dashboard-status"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 9px",
            borderRadius: t.radius.full,
            background: status.bg,
            color: status.color,
            fontSize: t.typography.fontSize.xs,
            fontWeight: needsAttention
              ? t.typography.fontWeight.bold
              : t.typography.fontWeight.medium,
            textDecoration: "none",
            lineHeight: 1.3,
          }}
        >
          <StatusIcon size={13} strokeWidth={2} />
          {status.label}
        </a>
      </div>

      {/* الإجراءات */}
      <div
        className="basita-dashboard-header-actions"
        style={{
          display: "flex",
          gap: t.spacing["2"],
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {needsAttention && (
          <a
            href="/pricing"
            className="basita-btn-interactive"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 42,
              padding: "0 15px",
              background: t.colors.semantic.danger,
              color: t.colors.white,
              borderRadius: 12,
              textDecoration: "none",
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              boxShadow: t.shadows.sm,
              whiteSpace: "nowrap",
            }}
          >
            تجديد الاشتراك
          </a>
        )}

        <a
          href={`/store/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="basita-btn-interactive"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            minHeight: 42,
            padding: "0 15px",
            background: t.colors.primary[800],
            color: t.colors.white,
            borderRadius: 12,
            textDecoration: "none",
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            boxShadow: t.shadows.sm,
            whiteSpace: "nowrap",
          }}
        >
          عرض المتجر
          <ExternalLink size={14} strokeWidth={1.8} />
        </a>
      </div>
    </div>
  );
}