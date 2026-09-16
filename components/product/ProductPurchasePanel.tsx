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
        ((product.comparePrice - effectivePrice) / product.comparePrice) * 100
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
        padding: t.spacing["5"],
        boxShadow: "0 10px 30px rgba(25, 45, 35, 0.055)",
      }}
    >
      {/* لمسة بصرية خفيفة أعلى لوحة الشراء */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          width: 90,
          height: 4,
          borderRadius: "0 0 6px 0",
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
          gap: t.spacing["2"],
          marginBottom: t.spacing["2"],
        }}
      >
        <span
          style={{
            fontSize: "clamp(28px, 3vw, 36px)",
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          {effectivePrice}{" "}
          <small
            style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.medium,
              color: t.colors.text.mid,
            }}
          >
            ر.س
          </small>
        </span>

        {product.comparePrice && product.comparePrice > effectivePrice && (
          <>
            <span
              style={{
                fontSize: t.typography.fontSize.sm,
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
                padding: "4px 9px",
                background: t.colors.semantic.dangerBg,
                color: t.colors.semantic.danger,
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.xs,
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
          gap: 7,
          padding: "6px 10px",
          marginBottom: t.spacing["4"],
          borderRadius: t.radius.full,
          background: outOfStock
            ? t.colors.semantic.dangerBg
            : t.colors.semantic.successBg,
          color: outOfStock
            ? t.colors.semantic.danger
            : t.colors.semantic.success,
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.bold,
        }}
      >
        {outOfStock ? (
          <XCircle size={14} strokeWidth={2} />
        ) : (
          <CheckCircle2 size={14} strokeWidth={2} />
        )}

        {outOfStock ? "نفدت الكمية" : `${maxQty} قطعة متوفرة`}
      </div>

      {/* المتغيرات */}
      <div
        style={{
          marginBottom: t.spacing["4"],
          paddingBottom: t.spacing["4"],
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
      <div style={{ marginBottom: t.spacing["4"] }}>
        <p
          style={{
            margin: `0 0 ${t.spacing["2"]}`,
            fontSize: t.typography.fontSize.sm,
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
            gap: t.spacing["3"],
            padding: "5px 6px",
            background: t.colors.cream.bg,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.full,
          }}
        >
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            disabled={outOfStock}
            aria-label="تقليل الكمية"
            className="basita-quantity-button"
            style={{
              width: 34,
              height: 34,
              borderRadius: t.radius.full,
              border: `1px solid ${t.colors.cream.border}`,
              background: t.colors.white,
              color: t.colors.text.dark,
              cursor: outOfStock ? "not-allowed" : "pointer",
              fontSize: 18,
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
              minWidth: 26,
              textAlign: "center",
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
            }}
          >
            {qty}
          </span>

          <button
            type="button"
            onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
            disabled={outOfStock || qty >= maxQty}
            aria-label="زيادة الكمية"
            className="basita-quantity-button basita-quantity-plus"
            style={{
              width: 34,
              height: 34,
              borderRadius: t.radius.full,
              border: "none",
              background: t.colors.primary[800],
              color: t.colors.white,
              cursor:
                outOfStock || qty >= maxQty ? "not-allowed" : "pointer",
              fontSize: 18,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: outOfStock || qty >= maxQty ? 0.5 : 1,
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
            padding: "10px 12px",
            background: t.colors.semantic.dangerBg,
            border: `1px solid rgba(180, 50, 50, 0.12)`,
            borderRadius: t.radius.md,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
            lineHeight: 1.7,
          }}
        >
          <AlertTriangle
            size={14}
            strokeWidth={1.8}
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <span>{error}</span>
        </div>
      )}

      {/* أزرار الشراء */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["2"],
        }}
      >
        <button
          type="button"
          onClick={onAddToCart}
          disabled={addingToCart || outOfStock}
          className="basita-purchase-button basita-cart-button"
          style={{
            width: "100%",
            minHeight: 50,
            padding: "13px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
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
              addingToCart || outOfStock ? "not-allowed" : "pointer",
            opacity: addingToCart || outOfStock ? 0.65 : 1,
          }}
        >
          {addedToCart ? (
            <>
              <CheckCircle2 size={17} strokeWidth={2} />
              أُضيف للسلة
            </>
          ) : addingToCart ? (
            "جاري الإضافة..."
          ) : (
            <>
              <ShoppingCart size={17} strokeWidth={1.8} />
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
            minHeight: 52,
            padding: "13px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
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
              checkingOut || outOfStock ? "not-allowed" : "pointer",
            opacity: checkingOut || outOfStock ? 0.72 : 1,
          }}
        >
          {checkingOut ? (
            "جاري التحويل لصفحة الدفع..."
          ) : (
            <>
              <Zap
                size={17}
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
            marginTop: 2,
            color: t.colors.text.light,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          <Lock size={12} strokeWidth={1.8} />
          <span>تسوقي بثقة وأمان</span>
        </div>
      </div>

      {/* عناصر الثقة والسياسات */}
      <div
        style={{
          marginTop: t.spacing["5"],
          paddingTop: t.spacing["4"],
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
          box-shadow: 0 14px 36px rgba(25, 45, 35, 0.075);
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
          box-shadow: 0 6px 16px rgba(25, 45, 35, 0.08);
        }

        .basita-buy-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(15, 61, 46, 0.18);
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
            margin-bottom: ${t.spacing["3"]} !important;
          }
        }

        @media (max-width: 420px) {
          .basita-purchase-panel {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-purchase-button {
            min-height: 50px !important;
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