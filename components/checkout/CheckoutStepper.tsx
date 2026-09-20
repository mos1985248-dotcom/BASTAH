// components/checkout/CheckoutStepper.tsx

import { t } from "@/theme";
import {
  ShoppingCart,
  FileEdit,
  CreditCard,
  Check,
  type LucideIcon,
} from "lucide-react";

const STEPS: {
  key: string;
  num: number;
  label: string;
  Icon: LucideIcon;
}[] = [
  {
    key: "cart",
    num: 1,
    label: "سلة المشتريات",
    Icon: ShoppingCart,
  },
  {
    key: "details",
    num: 2,
    label: "إتمام الطلب",
    Icon: FileEdit,
  },
  {
    key: "payment",
    num: 3,
    label: "الدفع",
    Icon: CreditCard,
  },
  {
    key: "confirm",
    num: 4,
    label: "تأكيد الطلب",
    Icon: Check,
  },
];

/**
 * صفحة /checkout الحالية تجمع "إتمام الطلب" (العنوان) و"الدفع" بصفحة واحدة
 * (نفس تدفق /api/checkout الفعلي) — لذا نُبرز الخطوتين معاً كمرحلة نشطة
 * واحدة بدل بناء صفحتين منفصلتين لمرحلة لا تحتاجها الدورة الخلفية فعلياً.
 */
export default function CheckoutStepper({
  current,
}: {
  current: "payment" | "confirm";
}) {
  const activeKeys =
    current === "confirm"
      ? ["confirm"]
      : ["details", "payment"];

  return (
    <nav
      dir="rtl"
      aria-label="مراحل إتمام الطلب"
      className="basita-checkout-stepper"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: `${t.spacing["2"]} ${t.spacing["2"]}`,
      }}
    >
      <div
        className="basita-checkout-stepper-inner"
        style={{
          width: "100%",
          maxWidth: 720,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 0,
          padding: `${t.spacing["2"]} ${t.spacing["3"]}`,
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          boxShadow: "0 3px 14px rgba(75, 56, 34, 0.035)",
        }}
      >
        {[...STEPS].reverse().map((step, i, arr) => {
          const isActive = activeKeys.includes(step.key);

          const isDone =
            current === "confirm" &&
            step.key !== "confirm";

          const isCompletedOrActive =
            isDone || isActive;

          const nextStep = arr[i + 1];

          const nextIsCompletedOrActive =
            nextStep &&
            (activeKeys.includes(nextStep.key) ||
              (current === "confirm" &&
                nextStep.key !== "confirm"));

          return (
            <div
              key={step.key}
              className="basita-checkout-step"
              style={{
                display: "flex",
                alignItems: "flex-start",
                flex: "1 1 0",
                minWidth: 0,
              }}
            >
              {/* Step */}
              <div
                style={{
                  flex: "0 0 auto",
                  minWidth: 70,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  textAlign: "center",
                }}
              >
                <div
                  className={`basita-checkout-step-circle ${
                    isActive ? "is-active" : ""
                  } ${isDone ? "is-done" : ""}`}
                  style={{
                    position: "relative",
                    width: 36,
                    height: 36,
                    borderRadius: t.radius.full,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isCompletedOrActive
                      ? t.colors.primary[800]
                      : t.colors.cream.bg,
                    border: `1.5px solid ${
                      isCompletedOrActive
                        ? t.colors.primary[800]
                        : t.colors.cream.border
                    }`,
                    color: isCompletedOrActive
                      ? t.colors.white
                      : t.colors.text.light,
                    boxShadow: isActive
                      ? "0 0 0 3px rgba(75, 56, 34, 0.055)"
                      : "none",
                    transition:
                      "background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
                  }}
                >
                  {isDone ? (
                    <Check
                      size={15}
                      strokeWidth={2.3}
                    />
                  ) : (
                    <step.Icon
                      size={15}
                      strokeWidth={1.8}
                    />
                  )}
                </div>

                <span
                  style={{
                    maxWidth: 86,
                    color: isActive
                      ? t.colors.primary[800]
                      : isDone
                        ? t.colors.text.mid
                        : t.colors.text.light,
                    fontSize: 11,
                    fontWeight: isActive
                      ? t.typography.fontWeight.bold
                      : t.typography.fontWeight.medium,
                    lineHeight: 1.4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < arr.length - 1 && (
                <div
                  aria-hidden="true"
                  className="basita-checkout-step-connector"
                  style={{
                    flex: "1 1 auto",
                    minWidth: 16,
                    height: 2,
                    marginTop: 17,
                    marginInline: 4,
                    borderRadius: t.radius.full,
                    background:
                      nextIsCompletedOrActive
                        ? t.colors.primary[800]
                        : t.colors.cream.border,
                    transition: "background 180ms ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .basita-checkout-step-circle.is-active {
          transform: scale(1.04);
        }

        @media (max-width: 640px) {
          .basita-checkout-stepper {
            padding-inline: 0 !important;
          }

          .basita-checkout-stepper-inner {
            padding: ${t.spacing["2"]} ${t.spacing["1"]} !important;
            border-radius: ${t.radius.md} !important;
          }

          .basita-checkout-step {
            min-width: 0 !important;
          }

          .basita-checkout-step > div:first-child {
            min-width: 58px !important;
          }

          .basita-checkout-step-circle {
            width: 33px !important;
            height: 33px !important;
          }

          .basita-checkout-step-circle svg {
            width: 14px !important;
            height: 14px !important;
          }

          .basita-checkout-step span {
            max-width: 64px !important;
            white-space: normal !important;
            font-size: 10px !important;
          }

          .basita-checkout-step-connector {
            min-width: 7px !important;
            margin-inline: 2px !important;
            margin-top: 15px !important;
          }
        }

        @media (max-width: 420px) {
          .basita-checkout-stepper-inner {
            padding: 7px 3px !important;
          }

          .basita-checkout-step > div:first-child {
            min-width: 50px !important;
          }

          .basita-checkout-step-circle {
            width: 30px !important;
            height: 30px !important;
          }

          .basita-checkout-step-circle svg {
            width: 13px !important;
            height: 13px !important;
          }

          .basita-checkout-step span {
            font-size: 9px !important;
            max-width: 54px !important;
          }

          .basita-checkout-step-connector {
            min-width: 4px !important;
            margin-top: 14px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-checkout-step-circle,
          .basita-checkout-step-connector {
            transition: none !important;
          }

          .basita-checkout-step-circle.is-active {
            transform: none !important;
          }
        }
      `}</style>
    </nav>
  );
}