// components/product/ProductPurchasePanel.tsx

import { t } from "@/theme";
import {
  XCircle,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Zap,
  Lock,
} from "lucide-react";
import ProductVariantSelector from "./ProductVariantSelector";
import ProductTrustBar from "./ProductTrustBar";
import ProductPolicyCards from "./ProductPolicyCards";
import { ProductDetail, ProductVariantItem } from "./types";

interface Props {
  product: ProductDetail;
  selectedVariant: ProductVariantItem | null;
  onSelectVariant: (id: string) => void;
  qty: number;
  onQtyChange: (q: number) => void;
  maxQty: number;
  effectivePrice: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  addingToCart: boolean;
  addedToCart: boolean;
  checkingOut: boolean;
  error: string;
}

export default function ProductPurchasePanel({
  product,
  selectedVariant,
  onSelectVariant,
  qty,
  onQtyChange,
  maxQty,
  effectivePrice,
  onAddToCart,
  onBuyNow,
  addingToCart,
  addedToCart,
  checkingOut,
  error,
}: Props) {
  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - effectivePrice) /
          product.comparePrice) *
          100
      )
    : 0;

  const outOfStock = maxQty === 0;

  return (
    <div
      dir="rtl"
      className="basita-purchase-panel"
      style={{
        position: "relative",
        overflow: "hidden",
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.xl,
        padding: t.spacing["4"],
        boxShadow: "0 8px 26px rgba(25, 45, 35, 0.05)",
      }}
    >
      {/* لمسة بصرية أعلى لوحة الشراء */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          width: 72,
          height: 3,
          borderRadius: "0 0 5px 0",
          background: t.colors.gold[600],
        }}
      />

      {/* السعر */}
      <div
        className="basita-price-row"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 7,
          marginBottom: t.spacing["2"],
        }}
      >
        <span
          style={{
            fontSize: "clamp(27px, 2.8vw, 34px)",
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          {effectivePrice}{" "}
          <small
            style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium,
              color: t.colors.text.mid,
            }}
          >
            ر.س
          </small>
        </span>

        {product.comparePrice &&
          product.comparePrice > effectivePrice && (
            <>
              <span
                style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.text.light,
                  textDecoration: "line-through",
                }}
              >
                {product.comparePrice} ر.س
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 8px",
                  background: t.colors.semantic.dangerBg,
                  color: t.colors.semantic.danger,
                  borderRadius: t.radius.full,
                  fontSize: 11,
                  fontWeight: t.typography.fontWeight.bold,
                }}
              >
                خصم {discount}٪
              </span>
            </>
          )}
      </div>

      {/* حالة المخزون */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 9px",
          marginBottom: t.spacing["3"],
          borderRadius: t.radius.full,
          background: outOfStock
            ? t.colors.semantic.dangerBg
            : t.colors.semantic.successBg,
          color: outOfStock
            ? t.colors.semantic.danger
            : t.colors.semantic.success,
          fontSize: 12,
          fontWeight: t.typography.fontWeight.bold,
        }}
      >
        {outOfStock ? (
          <XCircle size={13} strokeWidth={2} />
        ) : (
          <CheckCircle2 size={13} strokeWidth={2} />
        )}

        {outOfStock
          ? "نفدت الكمية"
          : `${maxQty} قطعة متوفرة`}
      </div>

      {/* المتغيرات */}
      <div
        style={{
          marginBottom: t.spacing["3"],
          paddingBottom: t.spacing["3"],
          borderBottom: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <ProductVariantSelector
          variants={product.variants}
          selectedId={selectedVariant?.id ?? null}
          onSelect={onSelectVariant}
          basePrice={product.price}
        />
      </div>

      {/* الكمية */}
      <div style={{ marginBottom: t.spacing["3"] }}>
        <p
          style={{
            margin: `0 0 ${t.spacing["2"]}`,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text.dark,
          }}
        >
          الكمية
        </p>

        <div
          className="basita-quantity-control"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: t.spacing["2"],
            padding: "4px 5px",
            background: t.colors.cream.bg,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.full,
          }}
        >
          <button
            type="button"
            onClick={() =>
              onQtyChange(Math.max(1, qty - 1))
            }
            disabled={outOfStock}
            aria-label="تقليل الكمية"
            className="basita-quantity-button"
            style={{
              width: 32,
              height: 32,
              borderRadius: t.radius.full,
              border: `1px solid ${t.colors.cream.border}`,
              background: t.colors.white,
              color: t.colors.text.dark,
              cursor: outOfStock
                ? "not-allowed"
                : "pointer",
              fontSize: 17,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: outOfStock ? 0.55 : 1,
            }}
          >
            −
          </button>

          <span
            style={{
              minWidth: 24,
              textAlign: "center",
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
            }}
          >
            {qty}
          </span>

          <button
            type="button"
            onClick={() =>
              onQtyChange(Math.min(maxQty, qty + 1))
            }
            disabled={outOfStock || qty >= maxQty}
            aria-label="زيادة الكمية"
            className="basita-quantity-button basita-quantity-plus"
            style={{
              width: 32,
              height: 32,
              borderRadius: t.radius.full,
              border: "none",
              background: t.colors.primary[800],
              color: t.colors.white,
              cursor:
                outOfStock || qty >= maxQty
                  ? "not-allowed"
                  : "pointer",
              fontSize: 17,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity:
                outOfStock || qty >= maxQty ? 0.5 : 1,
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: t.spacing["3"],
            padding: "9px 11px",
            background: t.colors.semantic.dangerBg,
            border: "1px solid rgba(180, 50, 50, 0.12)",
            borderRadius: t.radius.md,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
            lineHeight: 1.7,
          }}
        >
          <AlertTriangle
            size={14}
            strokeWidth={1.8}
            style={{
              flexShrink: 0,
              marginTop: 2,
            }}
          />

          <span>{error}</span>
        </div>
      )}

      {/* أزرار الشراء */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        <button
          type="button"
          onClick={onAddToCart}
          disabled={addingToCart || outOfStock}
          className="basita-purchase-button basita-cart-button"
          style={{
            width: "100%",
            minHeight: 48,
            padding: "11px 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: addedToCart
              ? t.colors.semantic.success
              : t.colors.cream.warm,
            color: addedToCart
              ? t.colors.white
              : t.colors.primary[800],
            border: `1.5px solid ${
              addedToCart
                ? t.colors.semantic.success
                : t.colors.primary[800]
            }`,
            borderRadius: t.radius.md,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            cursor:
              addingToCart || outOfStock
                ? "not-allowed"
                : "pointer",
            opacity:
              addingToCart || outOfStock ? 0.65 : 1,
          }}
        >
          {addedToCart ? (
            <>
              <CheckCircle2 size={16} strokeWidth={2} />
              أُضيف للسلة
            </>
          ) : addingToCart ? (
            "جاري الإضافة..."
          ) : (
            <>
              <ShoppingCart size={16} strokeWidth={1.8} />
              أضف إلى السلة
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBuyNow}
          disabled={checkingOut || outOfStock}
          className="basita-purchase-button basita-buy-button"
          style={{
            width: "100%",
            minHeight: 50,
            padding: "11px 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
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
            cursor:
              checkingOut || outOfStock
                ? "not-allowed"
                : "pointer",
            opacity:
              checkingOut || outOfStock ? 0.72 : 1,
          }}
        >
          {checkingOut ? (
            "جاري التحويل لصفحة الدفع..."
          ) : (
            <>
              <Zap
                size={16}
                strokeWidth={1.8}
                fill={t.colors.text.onDark}
              />
              اشترِ الآن
            </>
          )}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 1,
            color: t.colors.text.light,
            fontSize: 11,
          }}
        >
          <Lock size={11} strokeWidth={1.8} />
          <span>تسوقي بثقة وأمان</span>
        </div>
      </div>

      {/* عناصر الثقة والسياسات */}
      <div
        style={{
          marginTop: t.spacing["4"],
          paddingTop: t.spacing["3"],
          borderTop: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <ProductTrustBar />

        <ProductPolicyCards product={product} />
      </div>

      <style>{`
        .basita-purchase-panel {
          transition:
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .basita-purchase-panel:hover {
          border-color: rgba(15, 61, 46, 0.13);
          box-shadow: 0 12px 30px rgba(25, 45, 35, 0.07);
        }

        .basita-purchase-button {
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            background-color 160ms ease,
            border-color 160ms ease,
            opacity 160ms ease;
        }

        .basita-cart-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(25, 45, 35, 0.07);
        }

        .basita-buy-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 18px rgba(15, 61, 46, 0.17);
        }

        .basita-purchase-button:not(:disabled):active {
          transform: translateY(0);
        }

        .basita-quantity-button {
          transition:
            transform 140ms ease,
            box-shadow 140ms ease,
            background-color 140ms ease;
        }

        .basita-quantity-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 9px rgba(25, 45, 35, 0.08);
        }

        .basita-quantity-plus:not(:disabled):hover {
          background: ${t.colors.primary[700]} !important;
        }

        .basita-purchase-button:focus-visible,
        .basita-quantity-button:focus-visible {
          outline: 3px solid rgba(198, 164, 82, 0.25);
          outline-offset: 2px;
        }

        @media (max-width: 700px) {
          .basita-purchase-panel {
            padding: ${t.spacing["4"]} !important;
            border-radius: ${t.radius.lg} !important;
          }

          .basita-price-row {
            margin-bottom: ${t.spacing["2"]} !important;
          }
        }

        @media (max-width: 420px) {
          .basita-purchase-panel {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-purchase-button {
            min-height: 48px !important;
          }

          .basita-quantity-button {
            width: 31px !important;
            height: 31px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-purchase-panel,
          .basita-purchase-button,
          .basita-quantity-button {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}