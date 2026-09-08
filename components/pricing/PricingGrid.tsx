// components/pricing/PricingGrid.tsx
import { t } from "@/theme";
import PricingCard from "./PricingCard";
import type { PlanConfig } from "./plan-types";

export default function PricingGrid({ billing, plans }: { billing: "monthly" | "yearly"; plans: PlanConfig[] }) {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: `0 ${t.spacing["4"]} ${t.spacing["10"]}`,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: t.spacing["6"],
        alignItems: "stretch",
        direction: "rtl",
      }}
    >
      {plans.map((plan) => (
        <PricingCard key={plan.plan} plan={plan} billing={billing} />
      ))}
    </div>
  );
}