 // components/cart/CartStoreGroup.tsx

"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import CartItemRow from "./CartItemRow";
import CartOrderSummaryCard from "./CartOrderSummaryCard";
import { CartItemData } from "./types";
import { CheckoutPreview } from "@/components/checkout/OrderPricingSummary";

export default function CartStoreGroup({
  storeId,
  storeName,
  items,
  busyId,
  favoriteIds,
  addressId,
  onQtyChange,
  onRemove,
  onToggleFavorite,
}: {
  storeId: string;
  storeName: string;
  items: CartItemData[];
  busyId: string | null;
  favoriteIds: Set<string>;
  addressId: string;
  onQtyChange: (
    productId: string,
    variantId: string | null,
    qty: number
  ) => void;
  onRemove: (
    productId: string,
    variantId: string | null
  ) => void;
  onToggleFavorite: (productId: string) => void;
}) {
  const subtotal = items.reduce(
    (s, i) =>
      s +
      (i.variant?.price ?? i.product.price) *
        i.quantity,
    0
  );

  const hasIssue = items.some(
    (i) =>
      i.product.status !== "ACTIVE" ||
      (i.variant
        ? i.variant.quantity === 0
        : i.product.quantity === 0)
  );

  const [preview, setPreview] =
    useState<CheckoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] =
    useState(false);

  // ⚠️ نفس نقطة النهاية المستخدمة فعلياً بصفحة الدفع — لا حساب مستقل هنا
  useEffect(() => {
    if (!addressId || hasIssue) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);

    api
      .post<CheckoutPreview>(
        "/api/checkout/preview",
        {
          storeId,
          items: items.map((i) => ({
            productId: i.product.id,
            variantId:
              i.variantId ?? undefined,
            quantity: i.quantity,
          })),
          addressId,
          paymentMethod: "CREDIT_CARD",
        }
      )
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() =>
        setPreviewLoading(false)
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    storeId,
    addressId,
    hasIssue,
    items
      .map(
        (i) =>
          `${i.product.id}:${i.variantId}:${i.quantity}`
      )
      .join(","),
  ]);

  return (
    <section
      dir="rtl"
      className="basita-cart-store-group"
      aria-labelledby={`cart-store-${storeId}`}
      style={{
        marginBottom: t.spacing["5"],
      }}
    >
      <div
        className="basita-cart-group-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.72fr) minmax(300px, 0.95fr)",
          gap: t.spacing["4"],
          alignItems: "start",
        }}
      >
        {/* Store products */}
        <div
          className="basita-cart-store-products"
          style={{
            minWidth: 0,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.lg,
            overflow: "hidden",
            boxShadow:
              "0 5px 18px rgba(75, 56, 34, 0.035)",
          }}
        >
          {/* Store header */}
          <div
            className="basita-cart-store-header"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: t.spacing["3"],
              padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
              background: t.colors.cream.bg,
              borderBottom: `1px solid ${t.colors.cream.border}`,
              overflow: "hidden",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                insetInlineStart: 0,
                top: 0,
                width: 3,
                height: "100%",
                background: t.colors.gold[600],
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                minWidth: 0,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 35,
                  height: 35,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.md,
                  background: t.colors.white,
                  border: `1px solid ${t.colors.cream.border}`,
                  color: t.colors.primary[800],
                  boxShadow:
                    "0 2px 6px rgba(75, 56, 34, 0.035)",
                }}
              >
                <Store
                  size={17}
                  strokeWidth={1.7}
                />
              </span>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <h3
                  id={`cart-store-${storeId}`}
                  style={{
                    margin: 0,
                    color: t.colors.primary[800],
                    fontSize:
                      t.typography.fontSize.sm,
                    fontWeight:
                      t.typography.fontWeight.bold,
                    lineHeight: 1.45,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {storeName}
                </h3>

                <span
                  style={{
                    display: "block",
                    marginTop: 1,
                    color: t.colors.text.light,
                    fontSize: 11,
                    fontWeight:
                      t.typography.fontWeight.regular,
                    lineHeight: 1.45,
                  }}
                >
                  {items.length}{" "}
                  {items.length === 1
                    ? "منتج"
                    : "منتجات"}{" "}
                  في السلة
                </span>
              </div>
            </div>

            <span
              style={{
                flexShrink: 0,
                padding: "5px 9px",
                borderRadius: t.radius.full,
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                color: t.colors.text.mid,
                fontSize: 11,
                fontWeight:
                  t.typography.fontWeight.medium,
                whiteSpace: "nowrap",
              }}
            >
              متجر واحد
            </span>
          </div>

          {/* Cart items */}
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                className="basita-cart-item-wrapper"
                style={{
                  borderBottom: `1px solid ${t.colors.cream.borderLight}`,
                }}
              >
                <CartItemRow
                  item={item}
                  busy={busyId === item.id}
                  isFavorite={favoriteIds.has(
                    item.product.id
                  )}
                  onQtyChange={(q) =>
                    onQtyChange(
                      item.product.id,
                      item.variantId,
                      q
                    )
                  }
                  onRemove={() =>
                    onRemove(
                      item.product.id,
                      item.variantId
                    )
                  }
                  onToggleFavorite={() =>
                    onToggleFavorite(
                      item.product.id
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div
          className="basita-cart-summary-column"
          style={{
            minWidth: 0,
          }}
        >
          <CartOrderSummaryCard
            storeId={storeId}
            subtotal={subtotal}
            preview={preview}
            previewLoading={previewLoading}
            hasAddress={!!addressId}
            disabled={hasIssue}
          />
        </div>
      </div>

      <style>{`
        .basita-cart-item-wrapper:last-child {
          border-bottom: none !important;
        }

        @media (max-width: 980px) {
          .basita-cart-group-grid {
            grid-template-columns:
              minmax(0, 1fr) !important;
            gap: ${t.spacing["4"]} !important;
          }

          .basita-cart-summary-column {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .basita-cart-store-header {
            padding:
              ${t.spacing["3"]}
              ${t.spacing["3"]} !important;
          }

          .basita-cart-store-header > span:last-child {
            display: none !important;
          }
        }

        @media (max-width: 420px) {
          .basita-cart-store-products {
            border-radius:
              ${t.radius.md} !important;
          }

          .basita-cart-store-header {
            padding:
              ${t.spacing["2"]}
              ${t.spacing["3"]} !important;
          }

          .basita-cart-store-header > div {
            gap: 8px !important;
          }

          .basita-cart-store-header > div > span {
            width: 32px !important;
            height: 32px !important;
          }

          .basita-cart-store-header > div > span svg {
            width: 16px !important;
            height: 16px !important;
          }

          .basita-cart-store-header h3 {
            font-size: 13px !important;
          }

          .basita-cart-store-header
            > div
            > div
            > span {
            font-size: 10px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-cart-store-products {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}