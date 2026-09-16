// components/checkout/CheckoutConfirmPanel.tsx

import { AlertTriangle, Check, Lock } from "lucide-react";
import { t } from "@/theme";

interface Props {
  agreedToTerms: boolean;
  onAgreeChange: (v: boolean) => void;
  placing: boolean;
  placeError: string;
  paymentMethod: string;
  onConfirm: () => void;
}

export default function CheckoutConfirmPanel({
  agreedToTerms,
  onAgreeChange,
  placing,
  placeError,
  paymentMethod,
  onConfirm,
}: Props) {
  const isDisabled = placing || !agreedToTerms;

  return (
    <div
      dir="rtl"
      className="basita-checkout-confirm"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: t.spacing["3"],
      }}
    >
      {/* Terms */}
      <div
        className="basita-checkout-terms"
        style={{
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          padding: t.spacing["4"],
          boxShadow: "0 4px 16px rgba(75, 56, 34, 0.04)",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: t.spacing["3"],
            cursor: "pointer",
          }}
        >
          <span
            className="basita-check-wrap"
            style={{
              position: "relative",
              width: 22,
              height: 22,
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => onAgreeChange(e.target.checked)}
              aria-label="الموافقة على الشروط والأحكام وسياسة الخصوصية"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                margin: 0,
                opacity: 0,
                cursor: "pointer",
                zIndex: 2,
              }}
            />

            <span
              aria-hidden="true"
              className="basita-check-box"
              style={{
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: `1.5px solid ${
                  agreedToTerms
                    ? t.colors.primary[800]
                    : t.colors.cream.border
                }`,
                background: agreedToTerms
                  ? t.colors.primary[800]
                  : t.colors.white,
                color: t.colors.white,
                transition:
                  "background 160ms ease, border-color 160ms ease",
              }}
            >
              {agreedToTerms && (
                <Check
                  size={14}
                  strokeWidth={2.4}
                />
              )}
            </span>
          </span>

          <span
            style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.mid,
              lineHeight: 1.8,
            }}
          >
            أوافق على{" "}
            <a
              href="/terms"
              style={{
                color: t.colors.primary[800],
                fontWeight: t.typography.fontWeight.medium,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              الشروط والأحكام
            </a>{" "}
            و{" "}
            <a
              href="/privacy"
              style={{
                color: t.colors.primary[800],
                fontWeight: t.typography.fontWeight.medium,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              سياسة الخصوصية
            </a>
          </span>
        </label>
      </div>

      {/* Error */}
      {placeError && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            color: t.colors.semantic.danger,
            background: t.colors.semantic.dangerBg,
            border: `1px solid ${t.colors.semantic.danger}22`,
            padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
            borderRadius: t.radius.md,
            margin: 0,
            fontSize: t.typography.fontSize.sm,
            lineHeight: 1.7,
          }}
        >
          <AlertTriangle
            size={17}
            strokeWidth={1.8}
            style={{
              flexShrink: 0,
              marginTop: 2,
            }}
          />

          <span>{placeError}</span>
        </div>
      )}

      {/* Confirm button */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className="basita-checkout-confirm-button"
        style={{
          width: "100%",
          minHeight: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          padding: "14px 18px",
          background: isDisabled
            ? t.colors.primary[600]
            : t.colors.primary[800],
          color: t.colors.white,
          border: "none",
          borderRadius: t.radius.lg,
          fontSize: t.typography.fontSize.base,
          fontWeight: t.typography.fontWeight.bold,
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: !agreedToTerms ? 0.7 : 1,
          boxShadow: isDisabled
            ? "none"
            : "0 7px 18px rgba(75, 56, 34, 0.14)",
          transition:
            "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
        }}
      >
        <Lock
          size={17}
          strokeWidth={1.8}
        />

        <span>
          {placing
            ? "جاري تأكيد طلبك..."
            : paymentMethod === "CASH_ON_DELIVERY" ||
                paymentMethod === "BANK_TRANSFER"
              ? "تأكيد الطلب"
              : "تأكيد الطلب والدفع"}
        </span>
      </button>

      {/* Security note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          color: t.colors.text.light,
          fontSize: t.typography.fontSize.xs,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        <Lock
          size={12}
          strokeWidth={1.7}
        />
        <span>
          بالضغط على الزر، أنت توافقين على الشروط والأحكام
        </span>
      </div>

      <style>{`
        .basita-checkout-confirm-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 9px 22px rgba(75, 56, 34, 0.18) !important;
        }

        .basita-checkout-confirm-button:not(:disabled):active {
          transform: translateY(0);
        }

        .basita-checkout-confirm-button:focus-visible {
          outline: 3px solid ${t.colors.gold[600]};
          outline-offset: 3px;
        }

        .basita-check-wrap:focus-within .basita-check-box {
          outline: 3px solid ${t.colors.gold[600]};
          outline-offset: 2px;
        }

        .basita-checkout-terms a:hover {
          text-decoration-thickness: 2px;
        }

        @media (max-width: 480px) {
          .basita-checkout-terms {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-checkout-confirm-button {
            min-height: 52px !important;
            font-size: ${t.typography.fontSize.sm} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-check-box,
          .basita-checkout-confirm-button {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}