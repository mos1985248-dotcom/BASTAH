// components/pricing/PricingCard.tsx
"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Sparkles,
} from "lucide-react";
import { t } from "@/theme";
import type { PlanConfig } from "./plan-types";
import { useCurrentUser } from "@/app/providers";

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

  const highlighted = Boolean(plan.badgeAr);
  const hasOwnStore = Boolean(user?.store);

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.plan,
          billingCycle: billing,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error ?? "تعذّر تنفيذ العملية");
      }

      if (body.requiresPayment) {
        window.location.href = body.paymentUrl;
      } else {
        window.location.href = "/dashboard?planChanged=1";
      }
    } catch (err: any) {
      setError(err.message ?? "تعذّر تنفيذ العملية");
      setLoading(false);
    }
  };

  return (
    <article
      dir="rtl"
      className={`basita-pricing-card ${
        highlighted ? "basita-pricing-card-highlighted" : ""
      }`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: t.colors.white,
        borderRadius: t.radius.xl,
        border: `2px solid ${
          highlighted
            ? t.colors.gold[600]
            : t.colors.cream.border
        }`,
        padding: t.spacing["6"],
        textAlign: "right",
        boxShadow: highlighted
          ? t.shadows.gold
          : t.shadows.xs,
      }}
    >
      {/* لمسة بصرية للباقة المميزة */}
      {highlighted && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInlineStart: -55,
            top: -65,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217,179,108,0.18), transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* شارة الباقة */}
      {plan.badgeAr && (
        <span
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: t.colors.gold[600],
            color: t.colors.text.onDark,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            padding: "6px 11px",
            borderRadius: t.radius.full,
            boxShadow: t.shadows.sm,
            whiteSpace: "nowrap",
          }}
        >
          <Sparkles
            size={13}
            strokeWidth={2}
            aria-hidden="true"
          />
          {plan.badgeAr}
        </span>
      )}

      {/* رأس البطاقة */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: plan.badgeAr ? 36 : 0,
        }}
      >
        <h3
          style={{
            margin: `0 0 ${t.spacing["1"]}`,
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
            lineHeight: 1.35,
          }}
        >
          {plan.nameAr}
        </h3>

        <div
          style={{
            minHeight: 42,
            marginBottom: t.spacing["5"],
          }}
        >
          {plan.taglineAr && (
            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                color: t.colors.text.mid,
                fontWeight:
                  t.typography.fontWeight.medium,
                lineHeight: 1.7,
              }}
            >
              {plan.taglineAr}
            </p>
          )}
        </div>
      </div>

      {/* السعر */}
      <div
        className="basita-pricing-price"
        style={{
          position: "relative",
          zIndex: 1,
          margin: `0 0 ${t.spacing["5"]}`,
          padding: `${t.spacing["4"]} ${t.spacing["4"]}`,
          borderRadius: t.radius.lg,
          background: highlighted
            ? "rgba(217,179,108,0.09)"
            : t.colors.cream.bg,
          border: `1px solid ${
            highlighted
              ? "rgba(217,179,108,0.22)"
              : t.colors.cream.border
          }`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "clamp(32px, 4vw, 42px)",
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {displayPrice}
          </span>

          <span
            style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.mid,
              fontWeight:
                t.typography.fontWeight.medium,
            }}
          >
            ريال / شهريًا
          </span>
        </div>

        {billing === "yearly" && (
          <p
            style={{
              margin: "8px 0 0",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.semantic.success,
              fontWeight:
                t.typography.fontWeight.semibold,
            }}
          >
            عند الدفع السنوي
          </p>
        )}
      </div>

      {/* زر الاشتراك */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginBottom: t.spacing["5"],
        }}
      >
        {hasOwnStore ? (
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="basita-pricing-action basita-btn-interactive"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 48,
              textAlign: "center",
              padding: "12px 16px",
              borderRadius: t.radius.md,
              border: "none",
              background: highlighted
                ? t.colors.primary[800]
                : t.colors.primary[100],
              color: highlighted
                ? t.colors.text.onDark
                : t.colors.primary[800],
              fontWeight:
                t.typography.fontWeight.bold,
              fontSize: t.typography.fontSize.sm,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: highlighted
                ? t.shadows.md
                : t.shadows.sm,
            }}
          >
            {loading
              ? "جاري التحويل..."
              : "اختيار هذه الباقة"}
          </button>
        ) : (
          <a
            href={
              user
                ? "/dashboard/create-store"
                : "/register"
            }
            className="basita-pricing-action basita-btn-interactive"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 48,
              boxSizing: "border-box",
              textAlign: "center",
              padding: "12px 16px",
              borderRadius: t.radius.md,
              background: highlighted
                ? t.colors.primary[800]
                : t.colors.primary[100],
              color: highlighted
                ? t.colors.text.onDark
                : t.colors.primary[800],
              fontWeight:
                t.typography.fontWeight.bold,
              fontSize: t.typography.fontSize.sm,
              textDecoration: "none",
              boxShadow: highlighted
                ? t.shadows.md
                : t.shadows.sm,
            }}
          >
            {user
              ? "أنشئي متجرك الآن"
              : plan.priceMonthly === 0
                ? "ابدأي مجاناً"
                : "اشتركي الآن"}
          </a>
        )}
      </div>

      {/* الخطأ */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            margin: `0 0 ${t.spacing["4"]}`,
            padding: "10px 12px",
            borderRadius: t.radius.md,
            background: t.colors.semantic.dangerBg,
            border: `1px solid ${t.colors.semantic.danger}22`,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
            fontWeight:
              t.typography.fontWeight.bold,
            lineHeight: 1.6,
          }}
        >
          <AlertTriangle
            size={15}
            strokeWidth={1.9}
            style={{
              flexShrink: 0,
              marginTop: 2,
            }}
            aria-hidden="true"
          />

          <span>{error}</span>
        </div>
      )}

      {/* المميزات */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["3"],
          flex: 1,
          justifyContent: "flex-start",
          paddingTop: t.spacing["1"],
        }}
      >
        {plan.featuresAr.map((feature) => (
          <div
            key={feature}
            className="basita-pricing-feature"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: t.spacing["2"],
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.body,
              fontWeight:
                t.typography.fontWeight.medium,
              lineHeight: 1.65,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: t.radius.full,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
                background:
                  "rgba(34, 197, 94, 0.10)",
              }}
            >
              <Check
                size={14}
                strokeWidth={2.4}
                color={t.colors.semantic.success}
                aria-hidden="true"
              />
            </span>

            <span>{feature}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .basita-pricing-card {
          transition:
            transform ${t.motion.fast} ${t.motion.ease},
            box-shadow ${t.motion.fast} ${t.motion.ease};
        }

        .basita-pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: ${t.shadows.md};
        }

        .basita-pricing-card-highlighted:hover {
          box-shadow: ${t.shadows.gold};
        }

        .basita-pricing-action {
          transition:
            transform ${t.motion.fast} ${t.motion.ease},
            box-shadow ${t.motion.fast} ${t.motion.ease},
            background ${t.motion.fast} ${t.motion.ease};
        }

        .basita-pricing-action:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .basita-pricing-action:focus-visible {
          outline: 2px solid #d9b36c;
          outline-offset: 3px;
        }

        .basita-pricing-feature {
          transition:
            transform ${t.motion.fast} ${t.motion.ease};
        }

        .basita-pricing-feature:hover {
          transform: translateX(-2px);
        }

        @media (max-width: 600px) {
          .basita-pricing-card {
            padding: ${t.spacing["5"]} !important;
          }

          .basita-pricing-card:hover {
            transform: none;
          }

          .basita-pricing-price {
            padding: ${t.spacing["3"]} !important;
          }
        }

        @media (max-width: 400px) {
          .basita-pricing-card {
            padding: ${t.spacing["4"]} !important;
            border-radius: ${t.radius.lg} !important;
          }

          .basita-pricing-feature {
            font-size: ${t.typography.fontSize.xs} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-pricing-card,
          .basita-pricing-action,
          .basita-pricing-feature {
            transition: none !important;
          }

          .basita-pricing-card:hover,
          .basita-pricing-action:hover:not(:disabled),
          .basita-pricing-feature:hover {
            transform: none;
          }
        }
      `}</style>
    </article>
  );
}