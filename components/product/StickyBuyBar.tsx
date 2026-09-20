// components/product/StickyBuyBar.tsx

import { AlertTriangle, Minus, Plus, Lock } from "lucide-react";
import { t } from "@/theme";

export default function StickyBuyBar({
  qty,
  maxQty,
  onQtyChange,
  price,
  disabled,
  checkingOut,
  onBuyNow,
  error,
}: {
  qty: number;
  maxQty: number;
  onQtyChange: (q: number) => void;
  price: number;
  disabled: boolean;
  checkingOut: boolean;
  onBuyNow: () => void;
  error: string;
}) {
  return (
    <>
      {error && (
        <div
          role="alert"
          dir="rtl"
          className="basita-sticky-error"
          style={{
            position: "fixed",
            zIndex: 60,
            bottom: 82,
            insetInlineStart: 0,
            insetInlineEnd: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "7px 12px",
            color: t.colors.semantic.danger,
            fontSize: 12,
            fontWeight: t.typography.fontWeight.semibold,
            background: t.colors.semantic.dangerBg,
            borderTop: `1px solid ${t.colors.semantic.danger}22`,
            borderBottom: `1px solid ${t.colors.semantic.danger}22`,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: t.colors.white,
            }}
          >
            <AlertTriangle
              size={12}
              strokeWidth={1.9}
            />
          </span>

          <span
            style={{
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {error}
          </span>
        </div>
      )}

      <div
        dir="rtl"
        className="basita-sticky-buy-bar"
        style={{
          position: "fixed",
          zIndex: 50,
          bottom: 0,
          insetInlineStart: 0,
          insetInlineEnd: 0,
          display: "flex",
          alignItems: "center",
          gap: t.spacing["2"],
          padding:
            "8px max(12px, env(safe-area-inset-right)) 8px max(12px, env(safe-area-inset-left))",
          background: "rgba(255, 255, 255, 0.97)",
          borderTop: `1px solid ${t.colors.cream.border}`,
          boxShadow:
            "0 -7px 24px rgba(25, 45, 35, 0.075)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* الكمية */}
        <div
          className="basita-sticky-quantity"
          style={{
            flexShrink: 0,
            height: 42,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "0 4px",
            background: t.colors.cream.bg,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.full,
          }}
          aria-label="الكمية"
        >
          <button
            type="button"
            aria-label="تقليل الكمية"
            onClick={() =>
              onQtyChange(Math.max(1, qty - 1))
            }
            disabled={qty <= 1}
            className="basita-sticky-qty-button"
            style={{
              width: 31,
              height: 31,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: `1px solid ${t.colors.cream.border}`,
              background: t.colors.white,
              color: t.colors.text.dark,
              cursor:
                qty <= 1 ? "not-allowed" : "pointer",
              opacity: qty <= 1 ? 0.45 : 1,
              transition:
                "transform 140ms ease, box-shadow 140ms ease",
            }}
          >
            <Minus size={13} strokeWidth={2} />
          </button>

          <span
            style={{
              minWidth: 23,
              textAlign: "center",
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
            }}
          >
            {qty}
          </span>

          <button
            type="button"
            aria-label="زيادة الكمية"
            onClick={() =>
              onQtyChange(Math.min(maxQty, qty + 1))
            }
            disabled={qty >= maxQty}
            className="basita-sticky-qty-button basita-sticky-qty-plus"
            style={{
              width: 31,
              height: 31,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: `1px solid ${t.colors.primary[800]}`,
              background: t.colors.primary[800],
              color: t.colors.text.onDark,
              cursor:
                qty >= maxQty
                  ? "not-allowed"
                  : "pointer",
              opacity: qty >= maxQty ? 0.45 : 1,
              transition:
                "transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease",
            }}
          >
            <Plus size={13} strokeWidth={2} />
          </button>
        </div>

        {/* زر الشراء */}
        <button
          type="button"
          onClick={onBuyNow}
          disabled={disabled}
          className="basita-sticky-buy-button"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 14px",
            background: checkingOut
              ? t.colors.primary[600]
              : t.colors.primary[800],
            color: t.colors.text.onDark,
            border: `1px solid ${
              checkingOut
                ? t.colors.primary[600]
                : t.colors.primary[800]
            }`,
            borderRadius: t.radius.md,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            cursor: disabled
              ? "not-allowed"
              : "pointer",
            opacity: disabled ? 0.62 : 1,
            boxShadow: disabled
              ? "none"
              : "0 4px 13px rgba(15, 61, 46, 0.14)",
            transition:
              "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, opacity 160ms ease",
          }}
        >
          {!checkingOut && (
            <Lock
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          )}

          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {checkingOut
              ? "جاري التحويل لصفحة الدفع..."
              : `اشتري الآن — ${(price * qty).toFixed(2)} ر.س`}
          </span>
        </button>
      </div>

      <style>{`
        .basita-sticky-qty-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 9px rgba(25, 45, 35, 0.08);
        }

        .basita-sticky-qty-plus:not(:disabled):hover {
          background: ${t.colors.primary[700]} !important;
        }

        .basita-sticky-buy-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(15, 61, 46, 0.18) !important;
          background: ${t.colors.primary[700]} !important;
        }

        .basita-sticky-qty-button:focus-visible,
        .basita-sticky-buy-button:focus-visible {
          outline: 3px solid rgba(198, 164, 82, 0.28);
          outline-offset: 2px;
        }

        @media (max-width: 560px) {
          .basita-sticky-buy-bar {
            gap: 7px !important;
            padding-top: 7px !important;
            padding-bottom:
              calc(7px + env(safe-area-inset-bottom)) !important;
          }

          .basita-sticky-quantity {
            height: 40px !important;
          }

          .basita-sticky-buy-button {
            min-height: 40px !important;
            padding-inline: 11px !important;
          }
        }

        @media (max-width: 400px) {
          .basita-sticky-buy-bar {
            gap: 5px !important;
            padding-inline: 7px !important;
          }

          .basita-sticky-quantity {
            padding-inline: 3px !important;
          }

          .basita-sticky-qty-button {
            width: 29px !important;
            height: 29px !important;
          }

          .basita-sticky-buy-button {
            font-size: ${t.typography.fontSize.xs} !important;
            padding-inline: 8px !important;
          }

          .basita-sticky-buy-button svg {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-sticky-qty-button,
          .basita-sticky-buy-button {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}