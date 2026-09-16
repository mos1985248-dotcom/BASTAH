// components/cart/CartItemRow.tsx

import { Heart, XCircle, Trash2, Minus, Plus } from "lucide-react";
import { t } from "@/theme";
import { CartItemData } from "./types";

export default function CartItemRow({
  item,
  busy,
  isFavorite,
  onQtyChange,
  onRemove,
  onToggleFavorite,
}: {
  item: CartItemData;
  busy: boolean;
  isFavorite: boolean;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
  onToggleFavorite: () => void;
}) {
  const outOfStock =
    item.product.status !== "ACTIVE" ||
    (item.variant
      ? item.variant.quantity === 0
      : item.product.quantity === 0);

  const maxQty = item.variant
    ? item.variant.quantity
    : item.product.quantity;

  const effectivePrice = item.variant?.price ?? item.product.price;

  const variantLabel = item.variant
    ? Array.isArray(item.variant.options) &&
      item.variant.options[0]?.value
      ? item.variant.options[0].value
      : item.variant.nameAr
    : null;

  const imageUrl =
    item.variant?.image ?? item.product.mainImage;

  return (
    <article
      dir="rtl"
      className="basita-cart-row"
      style={{
        position: "relative",
        display: "flex",
        gap: t.spacing["3"],
        alignItems: "flex-start",
        padding: t.spacing["4"],
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        opacity: busy ? 0.58 : 1,
        boxShadow: "0 3px 14px rgba(25, 45, 35, 0.035)",
        transition:
          "opacity 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
      }}
    >
      {/* Product image */}
      <a
        href={`/products/${item.product.id}`}
        aria-label={`عرض ${item.product.nameAr}`}
        className="basita-cart-product-image-link"
        style={{
          position: "relative",
          flexShrink: 0,
          display: "block",
          textDecoration: "none",
        }}
      >
        <div
          className="basita-cart-product-image"
          style={{
            width: 88,
            height: 88,
            borderRadius: t.radius.md,
            overflow: "hidden",
            background: imageUrl
              ? `url(${imageUrl}) center/cover`
              : t.colors.gold[100],
            border: `1px solid ${t.colors.cream.border}`,
            boxShadow: "0 2px 8px rgba(25, 45, 35, 0.05)",
          }}
        />

        {outOfStock && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.md,
              background: "rgba(255,255,255,0.58)",
              color: t.colors.semantic.danger,
              fontSize: 10,
              fontWeight: t.typography.fontWeight.bold,
              textAlign: "center",
              padding: 5,
            }}
          >
            غير متاح
          </span>
        )}
      </a>

      {/* Product information */}
      <div
        className="basita-cart-product-info"
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: t.spacing["2"],
          }}
        >
          <a
            href={`/products/${item.product.id}`}
            style={{
              minWidth: 0,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <p
              className="basita-cart-product-name"
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.product.nameAr}
            </p>
          </a>

          <button
            type="button"
            onClick={onToggleFavorite}
            disabled={busy}
            aria-label={
              isFavorite
                ? "إزالة من المفضلة"
                : "إضافة للمفضلة"
            }
            className="basita-cart-favorite"
            style={{
              width: 34,
              height: 34,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${
                isFavorite
                  ? `${t.colors.semantic.danger}35`
                  : t.colors.cream.border
              }`,
              borderRadius: "50%",
              background: isFavorite
                ? `${t.colors.semantic.danger}0D`
                : t.colors.white,
              color: isFavorite
                ? t.colors.semantic.danger
                : t.colors.text.light,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
              transition:
                "transform 160ms ease, background-color 160ms ease, color 160ms ease",
            }}
          >
            <Heart
              size={16}
              strokeWidth={1.8}
              fill={
                isFavorite
                  ? t.colors.semantic.danger
                  : "none"
              }
            />
          </button>
        </div>

        <p
          style={{
            margin: "3px 0 7px",
            fontSize: t.typography.fontSize.xs,
            color: t.colors.text.mid,
            lineHeight: 1.5,
          }}
        >
          {item.product.store.nameAr}
        </p>

        {variantLabel && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              maxWidth: "100%",
              fontSize: t.typography.fontSize.xs,
              background: t.colors.cream.warm,
              color: t.colors.text.body,
              border: `1px solid ${t.colors.cream.border}`,
              padding: "3px 9px",
              borderRadius: t.radius.full,
              marginBottom: 7,
              lineHeight: 1.4,
            }}
          >
            {variantLabel}
          </span>
        )}

        {outOfStock ? (
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              margin: 0,
              fontSize: t.typography.fontSize.xs,
              color: t.colors.semantic.danger,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.5,
            }}
          >
            <XCircle size={13} strokeWidth={2} />
            نفدت الكمية أو المنتج غير متاح
          </p>
        ) : maxQty <= 5 ? (
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              margin: 0,
              fontSize: t.typography.fontSize.xs,
              color: t.colors.semantic.warning,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: t.colors.semantic.warning,
              }}
            />
            باقي {maxQty} فقط
          </p>
        ) : null}
      </div>

      {/* Price + quantity + remove */}
      <div
        className="basita-cart-row-actions"
        style={{
          flexShrink: 0,
          minWidth: 170,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: t.spacing["3"],
          alignSelf: "stretch",
        }}
      >
        <div
          style={{
            fontSize: t.typography.fontSize.lg,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
            whiteSpace: "nowrap",
          }}
        >
          {effectivePrice} ر.س
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* Quantity */}
          <div
            className="basita-cart-quantity"
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 4px",
              background: t.colors.cream.bg,
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: t.radius.full,
            }}
          >
            <button
              type="button"
              onClick={() =>
                onQtyChange(Math.max(1, item.quantity - 1))
              }
              disabled={busy || item.quantity <= 1}
              aria-label="إنقاص الكمية"
              className="basita-cart-qty-button"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: `1px solid ${t.colors.cream.border}`,
                background: t.colors.white,
                color: t.colors.text.dark,
                cursor:
                  busy || item.quantity <= 1
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  busy || item.quantity <= 1 ? 0.45 : 1,
              }}
            >
              <Minus size={13} strokeWidth={2} />
            </button>

            <span
              style={{
                minWidth: 24,
                textAlign: "center",
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.text.dark,
              }}
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                onQtyChange(
                  Math.min(
                    maxQty || 99,
                    item.quantity + 1
                  )
                )
              }
              disabled={
                busy ||
                outOfStock ||
                item.quantity >= maxQty
              }
              aria-label="زيادة الكمية"
              className="basita-cart-qty-button basita-cart-qty-plus"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: `1px solid ${t.colors.primary[800]}`,
                background: t.colors.primary[800],
                color: t.colors.white,
                cursor:
                  busy ||
                  outOfStock ||
                  item.quantity >= maxQty
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  busy ||
                  outOfStock ||
                  item.quantity >= maxQty
                    ? 0.45
                    : 1,
              }}
            >
              <Plus size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label="حذف المنتج"
            className="basita-cart-remove"
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              borderRadius: "50%",
              color: t.colors.text.light,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
            }}
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <style>{`
        .basita-cart-row:hover {
          border-color: rgba(15, 61, 46, 0.12) !important;
          box-shadow: 0 7px 20px rgba(25, 45, 35, 0.055) !important;
        }

        .basita-cart-product-image-link:hover
          .basita-cart-product-image {
          transform: scale(1.015);
        }

        .basita-cart-product-image {
          transition: transform 180ms ease;
        }

        .basita-cart-favorite:hover:not(:disabled) {
          transform: translateY(-1px);
          background: ${t.colors.cream.warm} !important;
        }

        .basita-cart-qty-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(25, 45, 35, 0.08);
        }

        .basita-cart-qty-plus:not(:disabled):hover {
          background: ${t.colors.primary[700]} !important;
        }

        .basita-cart-remove:hover:not(:disabled) {
          background: ${t.colors.cream.warm} !important;
          color: ${t.colors.semantic.danger} !important;
        }

        .basita-cart-favorite:focus-visible,
        .basita-cart-qty-button:focus-visible,
        .basita-cart-remove:focus-visible {
          outline: 3px solid rgba(198, 164, 82, 0.25);
          outline-offset: 2px;
        }

        @media (max-width: 700px) {
          .basita-cart-row {
            display: grid !important;
            grid-template-columns: 76px minmax(0, 1fr) !important;
            gap: 12px !important;
            padding: 13px !important;
          }

          .basita-cart-product-image {
            width: 76px !important;
            height: 76px !important;
          }

          .basita-cart-row-actions {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            min-width: 0 !important;
            flex-direction: row !important;
            align-items: center !important;
            align-self: auto !important;
            justify-content: space-between !important;
            gap: 10px !important;
            padding-top: 10px !important;
            border-top: 1px solid ${t.colors.cream.border} !important;
          }

          .basita-cart-product-name {
            font-size: ${t.typography.fontSize.sm} !important;
          }
        }

        @media (max-width: 390px) {
          .basita-cart-row {
            grid-template-columns: 64px minmax(0, 1fr) !important;
            gap: 10px !important;
            padding: 10px !important;
          }

          .basita-cart-product-image {
            width: 64px !important;
            height: 64px !important;
          }

          .basita-cart-quantity {
            height: 38px !important;
          }

          .basita-cart-qty-button {
            width: 30px !important;
            height: 30px !important;
          }

          .basita-cart-remove {
            width: 32px !important;
            height: 32px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-cart-row,
          .basita-cart-product-image,
          .basita-cart-favorite,
          .basita-cart-qty-button {
            transition: none !important;
          }
        }
      `}</style>
    </article>
  );
}