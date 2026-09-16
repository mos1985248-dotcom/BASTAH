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
      <div
        dir="rtl"
        className="basita-pricing-page"
        style={{
          width: "100%",
          boxSizing: "border-box",
          textAlign: "right",
          paddingBottom: t.spacing["16"],
        }}
      >
        {/* رأس صفحة الأسعار */}
        <section className="basita-pricing-header-section">
          <PricingHeader
            billing={billing}
            onBillingChange={setBilling}
          />
        </section>

        {/* محتوى الباقات */}
        <main
          className="basita-pricing-main"
          style={{
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {error ? (
            <section
              style={{
                width: "100%",
                maxWidth: 520,
                margin: "0 auto",
                padding: `${t.spacing["10"]} ${t.spacing["4"]}`,
                boxSizing: "border-box",
              }}
            >
              <ErrorState
                message={error}
                onRetry={load}
              />
            </section>
          ) : !plans ? (
            <section
              style={{
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: `${t.spacing["12"]} ${t.spacing["4"]}`,
                boxSizing: "border-box",
              }}
            >
              <LoadingState label="جاري تحميل الباقات..." />
            </section>
          ) : (
            <section
              className="basita-pricing-grid-section"
              style={{
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <PricingGrid
                billing={billing}
                plans={plans}
              />
            </section>
          )}
        </main>

        {/* مزايا بسطة */}
        <section
          className="basita-pricing-commission-section"
          style={{
            width: "100%",
            marginTop: t.spacing["10"],
          }}
        >
          <NoCommissionBanner />
        </section>

        {/* الأسئلة الشائعة */}
        <section
          className="basita-pricing-faq-section"
          style={{
            width: "100%",
            marginTop: t.spacing["8"],
          }}
        >
          <PricingFAQ />
        </section>

        <style jsx>{`
          .basita-pricing-page {
            overflow-x: hidden;
          }

          .basita-pricing-header-section {
            width: 100%;
          }

          .basita-pricing-main {
            width: 100%;
          }

          .basita-pricing-grid-section {
            width: 100%;
          }

          .basita-pricing-commission-section,
          .basita-pricing-faq-section {
            width: 100%;
          }

          @media (max-width: 768px) {
            .basita-pricing-commission-section {
              margin-top: ${t.spacing["8"]} !important;
            }

            .basita-pricing-faq-section {
              margin-top: ${t.spacing["6"]} !important;
            }
          }

          @media (max-width: 480px) {
            .basita-pricing-page {
              padding-bottom: ${t.spacing["10"]} !important;
            }

            .basita-pricing-commission-section {
              margin-top: ${t.spacing["6"]} !important;
            }

            .basita-pricing-faq-section {
              margin-top: ${t.spacing["5"]} !important;
            }
          }
        `}</style>
      </div>
    </SiteShell>
  );
}

