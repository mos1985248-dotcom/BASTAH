import { t } from "@/theme";
import PricingCard from "./PricingCard";
import type { PlanConfig } from "./plan-types";

export default function PricingGrid({
billing,
plans,
}: {
billing: "monthly" | "yearly";
plans: PlanConfig[];
}) {
return (
<div
className="basita-pricing-grid"
style={{
width: "100%",
maxWidth: t.layout.containerMaxWidth,
margin: "0 auto",
padding: `0 ${t.spacing["4"]} ${t.spacing["10"]}`,
boxSizing: "border-box",
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: t.spacing["6"],
alignItems: "stretch",
direction: "rtl",
}}
>
{plans.map((plan) => (
<div
key={plan.plan}
className="basita-pricing-grid-item"
style={{
minWidth: 0,
height: "100%",
display: "flex",
}}
> <PricingCard plan={plan} billing={billing} /> </div>
))}

```
  <style jsx>{`
    .basita-pricing-grid {
      align-items: stretch;
    }

    .basita-pricing-grid-item {
      align-items: stretch;
    }

    .basita-pricing-grid-item > :global(article) {
      width: 100%;
      height: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    @media (max-width: 900px) {
      .basita-pricing-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: ${t.spacing["5"]} !important;
      }
    }

    @media (max-width: 620px) {
      .basita-pricing-grid {
        grid-template-columns: 1fr !important;
        gap: ${t.spacing["4"]} !important;
        padding-left: ${t.spacing["3"]} !important;
        padding-right: ${t.spacing["3"]} !important;
      }
    }
  `}</style>
</div>
);
}
