// components/admin/ui/KpiCard.tsx
// ⚠️ لا يوجد حقل "نسبة التغيّر عن الشهر الماضي" بـ/api/admin/analytics —
// لذا هذا المكوّن لا يعرض أي مؤشر اتجاه مُخترَع. يعرض فقط القيمة الحقيقية
// + وصفاً ثابتاً اختيارياً (مثل "هذا الشهر") بدون أي رقم نسبي غير موجود.
import { t } from "@/theme";

export default function KpiCard({
  icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneColor = {
    default: t.colors.primary[800],
    success: t.colors.semantic.success,
    warning: t.colors.semantic.warning,
    danger: t.colors.semantic.danger,
  }[tone];

  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        border: `1px solid ${t.colors.cream.border}`,
        padding: t.spacing["4"],
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: t.radius.md,
            background: tone === "default" ? t.colors.primary[100] : `${toneColor}1A`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </div>
      <span style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: toneColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 11, color: t.colors.text.light }}>{sub}</span>}
    </div>
  );
}
