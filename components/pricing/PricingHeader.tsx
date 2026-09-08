// components/pricing/PricingHeader.tsx
import { t } from "@/theme";

export default function PricingHeader({
  billing,
  onBillingChange,
}: {
  billing: "monthly" | "yearly";
  onBillingChange: (v: "monthly" | "yearly") => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["8"]}`, direction: "rtl" }}>
      <h1
        style={{
          fontSize: t.typography.fontSize["3xl"],
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.primary[800],
          margin: `0 0 ${t.spacing["3"]}`,
        }}
      >
        باقات تناسب كل أسرة منتجة
      </h1>
      <p style={{ fontSize: t.typography.fontSize.md, color: t.colors.text.mid, margin: `0 0 ${t.spacing["6"]}`, fontWeight: t.typography.fontWeight.medium }}>
        بدون عمولة على مبيعاتك مهما كانت باقتك — رسوم اشتراك ثابتة فقط
      </p>

      <div
        style={{
          display: "inline-flex",
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.full,
          padding: "4px",
          boxShadow: t.shadows.xs,
        }}
      >
        {(["monthly", "yearly"] as const).map((opt) => {
          const active = billing === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onBillingChange(opt)}
              style={{
                padding: "8px 20px",
                borderRadius: t.radius.full,
                border: "none",
                background: active ? t.colors.primary[800] : "transparent",
                color: active ? t.colors.text.onDark : t.colors.text.mid,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {opt === "monthly" ? "شهري" : "سنوي (وفّري ٢٠٪)"}
            </button>
          );
        })}
      </div>
    </div>
  );
}