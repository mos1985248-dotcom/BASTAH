// components/home/PlansSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, X, ArrowLeft, Sparkles } from "lucide-react";
import { t } from "@/theme";
import type { PlanConfig } from "@/components/pricing/plan-types";

export default function PlansSection() {
  const [plans, setPlans] = useState<PlanConfig[] | null>(null);

  useEffect(() => {
    fetch("/api/subscription/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans))
      .catch(() => setPlans([]));
  }, []);

  if (!plans || plans.length === 0) return null;

  return (
    <section
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["10"]} ${t.spacing["4"]} 0`,
        direction: "rtl",
      }}
    >
      {/* عنوان القسم */}
      <div
        style={{
          textAlign: "center",
          marginBottom: t.spacing["6"],
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            padding: "6px 11px",
            borderRadius: 999,
            background: "#FFFDF8",
            border: "1px solid rgba(166,124,45,0.16)",
            color: t.colors.gold[700],
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
          }}
        >
          <Sparkles size={14} strokeWidth={1.8} />
          باقات بسطة
        </div>

        <h2
          style={{
            margin: `0 0 ${t.spacing["2"]}`,
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text.dark,
          }}
        >
          باقات تناسب كل أسرة منتجة
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: t.typography.fontSize.sm,
            color: t.colors.text.mid,
            lineHeight: t.typography.lineHeight.relaxed,
          }}
        >
          بدون عمولة على مبيعاتك مهما كانت باقتك — رسوم اشتراك ثابتة فقط
        </p>
      </div>

      {/* الباقات */}
      <div
        className="basita-plans-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: t.spacing["5"],
          alignItems: "stretch",
        }}
      >
        {plans.map((plan) => {
          const featured = Boolean(plan.badgeAr);

          return (
            <div
              key={plan.plan}
              className={`basita-plan-card ${
                featured ? "basita-plan-card-featured" : ""
              }`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: t.spacing["6"],
                borderRadius: 22,
                boxSizing: "border-box",
                background: featured ? "#F7F1E5" : "#FFFDF8",
                border: featured
                  ? "1.5px solid rgba(166,124,45,0.42)"
                  : "1px solid rgba(91,70,45,0.12)",
                boxShadow: featured
                  ? "0 12px 30px rgba(67,48,29,0.10)"
                  : "0 5px 16px rgba(67,48,29,0.045)",
                transition:
                  `transform ${t.motion.base} ${t.motion.ease}, ` +
                  `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
                  `border-color ${t.motion.base} ${t.motion.ease}`,
              }}
            >
              {featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    right: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: t.colors.gold[600],
                    color: t.colors.white,
                    fontSize: 11,
                    fontWeight: t.typography.fontWeight.bold,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                  }}
                >
                  <Sparkles size={12} strokeWidth={2} />
                  {plan.badgeAr}
                </div>
              )}

              {/* اسم الباقة */}
              <h3
                style={{
                  margin: `0 0 ${t.spacing["1"]}`,
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.primary[800],
                }}
              >
                {plan.nameAr}
              </h3>

              {plan.taglineAr && (
                <p
                  style={{
                    margin: `0 0 ${t.spacing["4"]}`,
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.text.mid,
                    lineHeight: 1.6,
                    minHeight: 28,
                  }}
                >
                  {plan.taglineAr}
                </p>
              )}

              {/* السعر */}
              <div
                style={{
                  marginBottom: t.spacing["4"],
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "center",
                  gap: 5,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: t.typography.fontSize["3xl"],
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.text.dark,
                    lineHeight: 1,
                  }}
                >
                  {plan.priceMonthly}
                </span>

                <span
                  style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.text.mid,
                  }}
                >
                  ر.س / شهريًا
                </span>
              </div>

              {/* خط فاصل */}
              <div
                style={{
                  width: "100%",
                  height: 1,
                  marginBottom: t.spacing["4"],
                  background: "rgba(91,70,45,0.10)",
                }}
              />

              {/* المميزات */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                  textAlign: "start",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.text.body,
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      marginTop: 6,
                      borderRadius: "50%",
                      background: t.colors.gold[600],
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    {plan.maxProducts === null
                      ? "منتجات غير محدودة"
                      : `${plan.maxProducts} منتج كحد أقصى`}
                  </span>
                </p>

                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    margin: 0,
                    fontSize: t.typography.fontSize.xs,
                    color: plan.hasAIFeatures
                      ? t.colors.semantic.success
                      : t.colors.text.light,
                  }}
                >
                  {plan.hasAIFeatures ? (
                    <Check size={15} strokeWidth={2.4} />
                  ) : (
                    <X size={15} strokeWidth={2} />
                  )}

                  {plan.hasAIFeatures
                    ? "مساعد الذكاء الاصطناعي (منيرة)"
                    : "بدون منيرة"}
                </p>

                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    margin: 0,
                    fontSize: t.typography.fontSize.xs,
                    color: plan.hasDaftari
                      ? t.colors.semantic.success
                      : t.colors.text.light,
                  }}
                >
                  {plan.hasDaftari ? (
                    <Check size={15} strokeWidth={2.4} />
                  ) : (
                    <X size={15} strokeWidth={2} />
                  )}

                  {plan.hasDaftari
                    ? "نظام المحاسبة (دفاتري)"
                    : "بدون دفاتري"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* رابط المقارنة */}
      <div
        style={{
          textAlign: "center",
          marginTop: t.spacing["6"],
        }}
      >
        <a
          href="/pricing"
          className="basita-plans-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: t.typography.fontSize.sm,
            color: t.colors.gold[700],
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
          }}
        >
          مقارنة كل الميزات بالتفصيل
          <ArrowLeft
            size={15}
            strokeWidth={2}
            style={{ transform: "rotate(180deg)" }}
          />
        </a>
      </div>

      <style>{`
        .basita-plan-card:hover {
          transform: translateY(-5px);
          border-color: rgba(166,124,45,0.26) !important;
          box-shadow: 0 14px 30px rgba(67,48,29,0.09);
        }

        .basita-plan-card-featured:hover {
          border-color: rgba(166,124,45,0.52) !important;
          box-shadow: 0 16px 34px rgba(67,48,29,0.12);
        }

        .basita-plans-link:hover {
          text-decoration: underline !important;
        }

        @media (max-width: 600px) {
          .basita-plans-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}