
import { t } from "@/theme";
import PricingCard from "./PricingCard";
import type { PlanConfig } from "./plan-types";
import styles from "./PricingGrid.module.css";

export default function PricingGrid({
  billing,
  plans,
}: {
  billing: "monthly" | "yearly";
  plans: PlanConfig[];
}) {
  return (
    <div
      className={styles.grid}
      dir="rtl"
    >
      {plans.map((plan) => (
        <div
          key={plan.plan}
          className={styles.item}
        >
          <PricingCard
            plan={plan}
            billing={billing}
          />
        </div>
      ))}
    </div>
  );
}
