// components/dashboard/DashboardHeader.tsx
import { ExternalLink } from "lucide-react";
import { t } from "@/theme";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "نشط", color: t.colors.semantic.success },
  TRIAL: { label: "تجريبي", color: t.colors.semantic.success },
  GRACE_PERIOD: { label: "فترة سماح — الاشتراك منتهٍ", color: t.colors.gold[600] },
  SUSPENDED: { label: "معلَّق — المنتجات غير ظاهرة", color: t.colors.semantic.danger },
  EXPIRED: { label: "منتهي", color: t.colors.semantic.danger },
  CANCELLED: { label: "مُلغى", color: t.colors.text.light },
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
  const status = STATUS_LABELS[subscriptionStatus ?? "ACTIVE"] ?? STATUS_LABELS.ACTIVE;
  const needsAttention = subscriptionStatus === "GRACE_PERIOD" || subscriptionStatus === "SUSPENDED" || subscriptionStatus === "EXPIRED";

  return (
    <div
      style={{
        background: t.colors.white,
        borderBottom: `1px solid ${t.colors.cream.border}`,
        padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: t.spacing["3"],
        direction: "rtl",
      }}
    >
      <div>
        <h1 style={{ margin: "0 0 4px", fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          {storeName}
        </h1>
        <a
          href="/dashboard/subscription"
          style={{
            fontSize: t.typography.fontSize.xs,
            color: status.color,
            fontWeight: needsAttention ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ● {status.label}
        </a>
      </div>
      <div style={{ display: "flex", gap: t.spacing["2"], alignItems: "center" }}>
        {needsAttention && (
          <a
            href="/pricing"
            className="basita-btn-interactive"
            style={{
              padding: "9px 18px",
              background: t.colors.semantic.danger,
              color: t.colors.white,
              borderRadius: t.radius.md,
              textDecoration: "none",
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              boxShadow: t.shadows.sm,
            }}
          >
            تجديد الاشتراك الآن
          </a>
        )}
        <a
          href={`/store/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="basita-btn-interactive"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            background: t.colors.primary[800],
            color: t.colors.white,
            borderRadius: t.radius.md,
            textDecoration: "none",
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            boxShadow: t.shadows.sm,
          }}
        >
          عرض المتجر
          <ExternalLink size={14} strokeWidth={1.8} />
        </a>
      </div>
    </div>
  );
}