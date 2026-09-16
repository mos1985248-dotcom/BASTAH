import { t } from "@/theme";

export default function PricingHeader({
billing,
onBillingChange,
}: {
billing: "monthly" | "yearly";
onBillingChange: (v: "monthly" | "yearly") => void;
}) {
return (
<section
className="basita-pricing-header"
dir="rtl"
style={{
width: "100%",
boxSizing: "border-box",
padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["8"]}`,
textAlign: "center",
}}
>
<div
style={{
width: "100%",
maxWidth: 820,
margin: "0 auto",
}}
>
<div
aria-hidden="true"
className="basita-pricing-header-mark"
style={{
width: 48,
height: 48,
margin: `0 auto ${t.spacing["4"]}`,
borderRadius: t.radius.full,
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "rgba(217,179,108,0.12)",
border: "1px solid rgba(217,179,108,0.22)",
boxSizing: "border-box",
}}
>
<span
style={{
width: 10,
height: 10,
borderRadius: t.radius.full,
background: t.colors.gold[600],
display: "block",
}}
/> </div>


    <h1
      style={{
        margin: `0 0 ${t.spacing["3"]}`,
        color: t.colors.primary[800],
        fontSize: "clamp(28px, 4vw, 40px)",
        lineHeight: 1.3,
        fontWeight: t.typography.fontWeight.bold,
        letterSpacing: "-0.02em",
      }}
    >
      باقات تناسب كل أسرة منتجة
    </h1>

    <p
      style={{
        maxWidth: 650,
        margin: `0 auto ${t.spacing["6"]}`,
        color: t.colors.text.mid,
        fontSize: "clamp(14px, 2vw, 16px)",
        lineHeight: 1.9,
        fontWeight: t.typography.fontWeight.medium,
      }}
    >
      بدون عمولة على مبيعاتك مهما كانت باقتك — رسوم اشتراك ثابتة فقط
    </p>

    <div
      className="basita-billing-switch"
      role="group"
      aria-label="دورة الفوترة"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: 4,
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.full,
        boxShadow: t.shadows.xs,
        boxSizing: "border-box",
      }}
    >
      {(["monthly", "yearly"] as const).map((opt) => {
        const active = billing === opt;

        return (
          <button
            key={opt}
            type="button"
            onClick={() => onBillingChange(opt)}
            aria-pressed={active}
            style={{
              minHeight: 42,
              padding: "9px 22px",
              borderRadius: t.radius.full,
              border: "none",
              background: active ? t.colors.primary[800] : "transparent",
              color: active
                ? t.colors.text.onDark
                : t.colors.text.mid,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.4,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {opt === "monthly" ? "شهري" : "سنوي (وفّري ٢٠٪)"}
          </button>
        );
      })}
    </div>
  </div>

  <style jsx>{`
    .basita-pricing-header {
      overflow: hidden;
    }

    .basita-billing-switch button:hover {
      opacity: 0.92;
    }

    .basita-billing-switch button:focus-visible {
      outline: 2px solid #d9b36c;
      outline-offset: 2px;
    }

    @media (max-width: 600px) {
      .basita-pricing-header {
        padding-top: ${t.spacing["8"]} !important;
        padding-bottom: ${t.spacing["6"]} !important;
      }

      .basita-pricing-header-mark {
        width: 42px !important;
        height: 42px !important;
        margin-bottom: ${t.spacing["3"]} !important;
      }

      .basita-billing-switch {
        width: 100%;
        max-width: 340px;
      }

      .basita-billing-switch button {
        flex: 1;
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
    }

    @media (max-width: 380px) {
      .basita-pricing-header {
        padding-left: ${t.spacing["3"]} !important;
        padding-right: ${t.spacing["3"]} !important;
      }

      .basita-billing-switch {
        max-width: 100%;
      }

      .basita-billing-switch button {
        font-size: ${t.typography.fontSize.xs} !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .basita-billing-switch button {
        transition: none !important;
      }
    }
  `}</style>
</section>
);
}
