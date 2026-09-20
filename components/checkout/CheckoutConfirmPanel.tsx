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
        gap: t.spacing["2"],
      }}
    >
      {/* Terms */}
      <div
        className="basita-checkout-terms"
        style={{
          position: "relative",
          overflow: "hidden",
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          padding: t.spacing["3"],
          boxShadow: "0 3px 12px rgba(75, 56, 34, 0.035)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 54,
            height: 3,
            background: t.colors.gold[600],
            borderRadius: `0 0 0 ${t.radius.full}`,
          }}
        />

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            cursor: "pointer",
          }}
        >
          <span
            className="basita-check-wrap"
            style={{
              position: "relative",
              width: 21,
              height: 21,
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
                width: 21,
                height: 21,
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
                  size={13}
                  strokeWidth={2.5}
                />
              )}
            </span>
          </span>

          <span
            style={{
              minWidth: 0,
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.mid,
              lineHeight: 1.75,
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
            gap: 8,
            color: t.colors.semantic.danger,
            background: t.colors.semantic.dangerBg,
            border: `1px solid ${t.colors.semantic.danger}22`,
            padding: "9px 12px",
            borderRadius: t.radius.md,
            margin: 0,
            fontSize: t.typography.fontSize.xs,
            lineHeight: 1.7,
          }}
        >
          <AlertTriangle
            size={16}
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
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "11px 16px",
          background: isDisabled
            ? t.colors.primary[600]
            : t.colors.primary[800],
          color: t.colors.white,
          border: "none",
          borderRadius: t.radius.md,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.bold,
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: !agreedToTerms ? 0.7 : 1,
          boxShadow: isDisabled
            ? "none"
            : "0 5px 14px rgba(75, 56, 34, 0.11)",
          transition:
            "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
        }}
      >
        <Lock
          size={16}
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
          gap: 5,
          paddingInline: 4,
          color: t.colors.text.light,
          fontSize: 11,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        <Lock
          size={11}
          strokeWidth={1.7}
        />

        <span>
          بالضغط على الزر، أنت توافقين على الشروط والأحكام
        </span>
      </div>

      <style>{`
        .basita-checkout-confirm-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 18px rgba(75, 56, 34, 0.15) !important;
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
          .basita-checkout-confirm {
            gap: ${t.spacing["2"]} !important;
          }

          .basita-checkout-terms {
            padding: 11px !important;
          }

          .basita-checkout-confirm-button {
            min-height: 47px !important;
            font-size: ${t.typography.fontSize.sm} !important;
            border-radius: ${t.radius.md} !important;
          }
        }

        @media (max-width: 360px) {
          .basita-checkout-terms {
            padding: 10px !important;
          }

          .basita-checkout-terms label {
            gap: 8px !important;
          }

          .basita-check-wrap,
          .basita-check-box {
            width: 20px !important;
            height: 20px !important;
          }

          .basita-checkout-terms label > span:last-child {
            font-size: 13px !important;
          }

          .basita-checkout-confirm-button {
            min-height: 45px !important;
            padding-inline: 12px !important;
          }

          .basita-checkout-confirm-button svg {
            width: 15px !important;
            height: 15px !important;
          }

          .basita-checkout-confirm > div:last-child {
            font-size: 10px !important;
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