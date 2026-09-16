// components/checkout/OrderSummary.tsx

import { ClipboardList, Package } from "lucide-react";
import { t } from "@/theme";
import { CartItemData } from "@/components/cart/types";
import OrderPricingSummary, {
  CheckoutPreview,
} from "./OrderPricingSummary";

export default function OrderSummary({
  items,
  storeName,
  preview,
  previewLoading,
}: {
  items: CartItemData[];
  storeName: string;
  preview: CheckoutPreview | null;
  previewLoading: boolean;
}) {
  return (
    <section
      dir="rtl"
      className="basita-checkout-order-summary"
      aria-labelledby="checkout-order-summary-title"
      style={{
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        overflow: "hidden",
        boxShadow: "0 5px 20px rgba(75, 56, 34, 0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
          background: t.colors.cream.bg,
          borderBottom: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInlineStart: 0,
            top: 0,
            width: 4,
            height: "100%",
            background: t.colors.gold[600],
          }}
        />

        <span
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.md,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            color: t.colors.primary[800],
            boxShadow: "0 2px 8px rgba(75, 56, 34, 0.05)",
          }}
        >
          <ClipboardList
            size={19}
            strokeWidth={1.7}
          />
        </span>

        <div style={{ minWidth: 0 }}>
          <h3
            id="checkout-order-summary-title"
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              lineHeight: 1.45,
            }}
          >
            ملخص الطلب
          </h3>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.light,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {storeName}
          </p>
        </div>
      </div>

      {/* Items */}
      <div
        className="basita-checkout-summary-items"
        style={{
          padding: t.spacing["4"],
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["2"],
        }}
      >
        {items.map((i) => (
          <div
            key={i.id}
            className="basita-checkout-summary-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: t.spacing["3"],
              minWidth: 0,
              padding: `${t.spacing["2"]} 0`,
            }}
          >
            {/* Product image */}
            <div
              aria-hidden="true"
              style={{
                position: "relative",
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: t.radius.md,
                overflow: "hidden",
                background: i.product.mainImage
                  ? `url(${i.product.mainImage}) center/cover`
                  : t.colors.gold[100],
                border: `1px solid ${t.colors.cream.border}`,
                boxShadow: "0 2px 8px rgba(75, 56, 34, 0.05)",
              }}
            >
              {!i.product.mainImage && (
                <Package
                  size={19}
                  strokeWidth={1.5}
                  color={t.colors.primary[800]}
                  style={{
                    position: "absolute",
                    inset: 0,
                    margin: "auto",
                  }}
                />
              )}
            </div>

            {/* Product info */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.text.dark,
                  lineHeight: 1.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={i.product.nameAr}
              >
                {i.product.nameAr}
              </p>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginTop: 4,
                  padding: "2px 7px",
                  borderRadius: t.radius.full,
                  background: t.colors.cream.warm,
                  color: t.colors.text.light,
                  fontSize: t.typography.fontSize.xs,
                  lineHeight: 1.5,
                }}
              >
                الكمية: {i.quantity}
              </span>
            </div>

            {/* Price */}
            <span
              style={{
                flexShrink: 0,
                color: t.colors.text.body,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                whiteSpace: "nowrap",
              }}
            >
              {i.product.price * i.quantity} ر.س
            </span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div
        style={{
          padding: `0 ${t.spacing["4"]} ${t.spacing["4"]}`,
        }}
      >
        <OrderPricingSummary
          preview={preview}
          loading={previewLoading}
        />
      </div>

      <style>{`
        .basita-checkout-summary-item + .basita-checkout-summary-item {
          border-top: 1px solid ${t.colors.cream.borderLight};
        }

        @media (max-width: 480px) {
          .basita-checkout-summary-items {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-checkout-summary-item {
            gap: ${t.spacing["2"]} !important;
          }

          .basita-checkout-summary-item > div:first-child {
            width: 46px !important;
            height: 46px !important;
          }

          .basita-checkout-summary-item > span:last-child {
            font-size: ${t.typography.fontSize.xs} !important;
          }

          .basita-checkout-order-summary > div:last-child {
            padding-inline: ${t.spacing["3"]} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-checkout-summary-item {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}