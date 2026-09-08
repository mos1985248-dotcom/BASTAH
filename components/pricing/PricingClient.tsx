// components/pricing/PricingClient.tsx
"use client";

import { useEffect, useState } from "react";
import SiteShell from "@/components/layout/SiteShell";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingGrid from "@/components/pricing/PricingGrid";
import NoCommissionBanner from "@/components/pricing/NoCommissionBanner";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import { t } from "@/theme";
import type { PlanConfig } from "./plan-types";

export default function PricingClient() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<PlanConfig[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    fetch("/api/subscription/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans))
      .catch(() => setError("تعذّر تحميل الباقات — حاولي مجدداً"));
  };

  useEffect(load, []);

  return (
    <SiteShell>
      <div style={{ direction: "rtl", textAlign: "right" }}>
        <PricingHeader billing={billing} onBillingChange={setBilling} />
        {error ? (
          <div style={{ padding: t.spacing["8"], maxWidth: 480, margin: "0 auto" }}>
            <ErrorState message={error} onRetry={load} />
          </div>
        ) : !plans ? (
          <div style={{ padding: t.spacing["16"] }}><LoadingState label="جاري تحميل الباقات..." /></div>
        ) : (
          <PricingGrid billing={billing} plans={plans} />
        )}
        <NoCommissionBanner />
        <PricingFAQ />
      </div>
    </SiteShell>
  );
}