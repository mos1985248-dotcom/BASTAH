
// components/pricing/PricingClient.tsx
"use client";

import { useEffect, useState } from "react";
import SiteShell from "@/components/layout/SiteShell";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingGrid from "@/components/pricing/PricingGrid";
import NoCommissionBanner from "@/components/pricing/NoCommissionBanner";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import { t } from "@/theme";
import type { PlanConfig } from "./plan-types";
import { ArrowLeft, HelpCircle } from "lucide-react";

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

        {/* رابط الأسئلة الشائعة */}
        <section
          className="basita-pricing-faq-link-section"
          aria-label="الأسئلة الشائعة"
        >
          <a href="/faq" className="basita-pricing-faq-link">
            <span className="basita-pricing-faq-link-icon" aria-hidden="true">
              <HelpCircle size={18} strokeWidth={1.9} />
            </span>

            <span className="basita-pricing-faq-link-content">
              <strong>لديكِ أسئلة عن الباقات؟</strong>
              <span>اطلعي على الأسئلة الشائعة قبل اختيار باقتك</span>
            </span>

            <ArrowLeft
              className="basita-pricing-faq-link-arrow"
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </a>
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

          .basita-pricing-commission-section {
            width: 100%;
          }

          .basita-pricing-faq-link-section {
            width: 100%;
            max-width: 980px;
            margin: ${t.spacing["8"]} auto 0;
            padding: 0 ${t.spacing["3"]};
            box-sizing: border-box;
          }

          .basita-pricing-faq-link {
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            gap: ${t.spacing["3"]};
            padding: ${t.spacing["4"]} ${t.spacing["5"]};
            border-radius: ${t.radius.lg};
            background: ${t.colors.cream.bg};
            border: 1px solid ${t.colors.cream.border};
            color: ${t.colors.text.dark};
            text-decoration: none;
            box-shadow: ${t.shadows.xs};
            transition:
              transform ${t.motion.fast} ${t.motion.ease},
              border-color ${t.motion.fast} ${t.motion.ease},
              box-shadow ${t.motion.fast} ${t.motion.ease};
          }

          .basita-pricing-faq-link:hover {
            transform: translateY(-2px);
            border-color: rgba(217, 179, 108, 0.45);
            box-shadow: ${t.shadows.sm};
          }

          .basita-pricing-faq-link-icon {
            width: 38px;
            height: 38px;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: ${t.radius.full};
            background: rgba(217, 179, 108, 0.13);
            color: ${t.colors.gold[600]};
          }

          .basita-pricing-faq-link-content {
            min-width: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .basita-pricing-faq-link-content strong {
            color: ${t.colors.primary[800]};
            font-size: ${t.typography.fontSize.sm};
            font-weight: ${t.typography.fontWeight.bold};
            line-height: 1.5;
          }

          .basita-pricing-faq-link-content span {
            color: ${t.colors.text.mid};
            font-size: ${t.typography.fontSize.xs};
            font-weight: ${t.typography.fontWeight.medium};
            line-height: 1.6;
          }

          .basita-pricing-faq-link-arrow {
            flex-shrink: 0;
            color: ${t.colors.gold[600]};
            transition: transform ${t.motion.fast} ${t.motion.ease};
          }

          .basita-pricing-faq-link:hover .basita-pricing-faq-link-arrow {
            transform: translateX(-3px);
          }

          @media (max-width: 768px) {
            .basita-pricing-commission-section {
              margin-top: ${t.spacing["8"]} !important;
            }

            .basita-pricing-faq-link-section {
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

            .basita-pricing-faq-link-section {
              margin-top: ${t.spacing["5"]} !important;
              padding-left: ${t.spacing["3"]};
              padding-right: ${t.spacing["3"]};
            }

            .basita-pricing-faq-link {
              padding: ${t.spacing["4"]};
            }

            .basita-pricing-faq-link-icon {
              width: 34px;
              height: 34px;
            }

            .basita-pricing-faq-link-arrow {
              display: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .basita-pricing-faq-link,
            .basita-pricing-faq-link-arrow {
              transition: none !important;
            }

            .basita-pricing-faq-link:hover {
              transform: none;
            }
          }
        `}</style>
      </div>
    </SiteShell>
  );
}
