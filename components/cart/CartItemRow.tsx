// components/cart/CartItemRow.tsx
import { Heart, XCircle, Trash2 } from "lucide-react";
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
  const outOfStock = item.product.status !== "ACTIVE" || (item.variant ? item.variant.quantity === 0 : item.product.quantity === 0);
  const maxQty = item.variant ? item.variant.quantity : item.product.quantity;
  const effectivePrice = item.variant?.price ?? item.product.price;
  const variantLabel = item.variant
    ? Array.isArray(item.variant.options) && item.variant.options[0]?.value
      ? item.variant.options[0].value
      : item.variant.nameAr
    : null;

  return (
    <div
      style={{
        display: "flex",
        gap: t.spacing["3"],
        alignItems: "center",
        padding: `${t.spacing["4"]} 0`,
        opacity: busy ? 0.5 : 1,
        flexWrap: "wrap",
      }}
      className="basita-cart-row"
    >
      <a href={`/products/${item.product.id}`} style={{ flexShrink: 0, position: "relative" }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: t.radius.md,
            background: (item.variant?.image ?? item.product.mainImage)
              ? `url(${item.variant?.image ?? item.product.mainImage}) center/cover`
              : t.colors.gold[100],
          }}
        />
      </a>

      <div style={{ flex: 1, minWidth: 130 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: t.spacing["2"] }}>
          <a href={`/products/${item.product.id}`} style={{ textDecoration: "none" }}>
            <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
              {item.product.nameAr}
            </p>
          </a>
          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: isFavorite ? t.colors.semantic.danger : t.colors.text.light, flexShrink: 0, padding: 4 }}
          >
            <Heart size={18} strokeWidth={1.8} fill={isFavorite ? t.colors.semantic.danger : "none"} />
          </button>
        </div>

        <p style={{ margin: "0 0 4px", fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{item.product.store.nameAr}</p>

        {variantLabel && (
          <span
            style={{
              display: "inline-block",
              fontSize: t.typography.fontSize.xs,
              background: t.colors.cream.warm,
              color: t.colors.text.body,
              padding: "2px 10px",
              borderRadius: t.radius.full,
              marginBottom: 4,
            }}
          >
            {variantLabel}
          </span>
        )}

        {outOfStock ? (
          <p style={{ display: "flex", alignItems: "center", gap: 5, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.bold }}>
            <XCircle size={13} strokeWidth={2} />
            نفدت الكمية أو المنتج غير متاح
          </p>
        ) : maxQty <= 5 ? (
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.warning }}>باقي {maxQty} فقط</p>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: t.spacing["3"], flexBasis: "100%", marginTop: t.spacing["1"] }} className="basita-cart-row-actions">
        <span style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{effectivePrice} ر.س</span>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: t.spacing["1"], background: t.colors.cream.bg, borderRadius: t.radius.full, padding: "2px 4px" }}>
            <button
              onClick={() => onQtyChange(Math.max(1, item.quantity - 1))}
              disabled={busy}
              aria-label="إنقاص الكمية"
              style={{ width: 34, height: 34, borderRadius: t.radius.full, border: "none", background: t.colors.white, cursor: "pointer", fontSize: 16 }}
            >
              −
            </button>
            <span style={{ fontSize: t.typography.fontSize.sm, minWidth: 22, textAlign: "center", fontWeight: t.typography.fontWeight.semibold }}>{item.quantity}</span>
            <button
              onClick={() => onQtyChange(Math.min(maxQty || 99, item.quantity + 1))}
              disabled={busy || outOfStock || item.quantity >= maxQty}
              aria-label="زيادة الكمية"
              style={{ width: 34, height: 34, borderRadius: t.radius.full, border: "none", background: t.colors.primary[800], color: t.colors.white, cursor: "pointer", fontSize: 16, opacity: item.quantity >= maxQty ? 0.5 : 1 }}
            >
              +
            </button>
          </div>

          <button
            onClick={onRemove}
            disabled={busy}
            aria-label="حذف المنتج"
            style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: t.colors.text.light }}
          >
            <Trash2 size={17} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
