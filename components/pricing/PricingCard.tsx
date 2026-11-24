
// components/pricing/PricingCard.tsx
"use client";

import { useState } from "react";
import { uiVars } from "@/components/ui/vars";
import styles from "./PricingCard.module.css";
import { formatPlatformCopy } from "@/lib/brand";
import type { PlanConfig } from "./plan-types";
import { useCurrentUser } from "@/app/providers";

function cardText(text: string) {
  return formatPlatformCopy(text).replace(/[⭐🌟✨★☆✦✧]\uFE0F?/gu, "").trim();
}

export default function PricingCard({
  plan,
  billing,
}: {
  plan: PlanConfig;
  billing: "monthly" | "yearly";
}) {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayPrice =
    billing === "yearly"
      ? Math.round(plan.priceYearly / 12)
      : plan.priceMonthly;

  const badge = plan.badgeAr ? cardText(plan.badgeAr) : "";
  const hasOwnStore = Boolean(user?.store);

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: plan.plan,
          billingCycle: billing,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(
          body?.error ?? "تعذّر تنفيذ العملية"
        );
      }

      if (body.requiresPayment) {
        window.location.href = body.paymentUrl;
      } else {
        window.location.href =
          "/dashboard?planChanged=1";
      }
    } catch (err: any) {
      setError(
        err.message ?? "تعذّر تنفيذ العملية"
      );
      setLoading(false);
    }
  };

  const actionClass = `${styles.action} basita-btn-interactive`;

  return (
    <article dir="rtl" className={styles.card} data-highlighted={Boolean(badge)} style={uiVars}>
      <header className={styles.header}>
        <div className={styles.badgeSlot}>{badge && <span className={styles.badge}>{badge}</span>}</div>
        <h3>{cardText(plan.nameAr)}</h3>
        {plan.taglineAr && <p>{cardText(plan.taglineAr)}</p>}
      </header>

      <div className={styles.price}>
        <div><strong>{displayPrice}</strong><span>ريال / شهريًا</span></div>
        {billing === "yearly" && <p>عند الدفع السنوي</p>}
      </div>

      {hasOwnStore ? (
        <button type="button" onClick={handleUpgrade} disabled={loading} className={actionClass}>
          {loading ? "جاري التحويل..." : "اختيار هذه الباقة"}
        </button>
      ) : (
        <a href={user ? "/dashboard/create-store" : "/register"} className={actionClass}>
          {user ? "أنشئي متجرك الآن" : plan.priceMonthly === 0 ? "ابدأي مجاناً" : "اشتركي الآن"}
        </a>
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}

      <ul className={styles.features}>
        {plan.featuresAr.map(feature => <li key={feature}>{cardText(feature)}</li>)}
      </ul>
    </article>
  );
}
