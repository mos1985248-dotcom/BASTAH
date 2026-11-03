// components/cart/CartItemRow.tsx — عرض فقط؛ المنطق (الكمية/الحذف/المفضلة) يأتي من الصفحة كما هو.
import { AlertTriangle, Heart, Trash2 } from "lucide-react";
import QuantityStepper from "@/components/product/QuantityStepper";
import { CartItemData } from "./types";
import s from "./items.module.css";

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
    (item.variant ? item.variant.quantity === 0 : item.product.quantity === 0);

  const maxQty = item.variant ? item.variant.quantity : item.product.quantity;
  const effectivePrice = item.variant?.price ?? item.product.price;

  const variantLabel = item.variant
    ? Array.isArray(item.variant.options) && item.variant.options[0]?.value
      ? item.variant.options[0].value
      : item.variant.nameAr
    : null;

  const imageUrl = item.variant?.image ?? item.product.mainImage;
  const href = `/products/${item.product.id}`;

  return (
    <article className={`${s.row} ${busy ? s.busy : ""}`} aria-busy={busy}>
      <a
        href={href}
        className={s.thumb}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        aria-label={`عرض ${item.product.nameAr}`}
      >
        {outOfStock && <span className={s.unavailable}>غير متاح</span>}
      </a>

      <div className={s.info}>
        <div className={s.top}>
          <a href={href} className={s.name}>{item.product.nameAr}</a>
          <div className={s.tools}>
            <button
              type="button"
              className={`${s.iconBtn} ${isFavorite ? s.favOn : ""}`}
              onClick={onToggleFavorite}
              disabled={busy}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            >
              <Heart size={18} strokeWidth={1.8} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              className={`${s.iconBtn} ${s.remove}`}
              onClick={onRemove}
              disabled={busy}
              aria-label="حذف المنتج"
            >
              <Trash2 size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {variantLabel && <span className={s.variant}>{variantLabel}</span>}

        {outOfStock ? (
          <p className={s.stockOut}>
            <AlertTriangle size={15} strokeWidth={1.9} aria-hidden="true" />
            نفدت الكمية أو المنتج غير متاح
          </p>
        ) : maxQty <= 5 ? (
          <p className={s.stockLow}>باقي {maxQty} فقط</p>
        ) : null}

        <div className={s.bottom}>
          <QuantityStepper qty={item.quantity} maxQty={maxQty} onChange={onQtyChange} disabled={busy} />
          <div className={s.prices}>
            <span className={s.unit}>{effectivePrice} ر.س</span>
            {item.quantity > 1 && (
              <span className={s.lineTotal}>المجموع {effectivePrice * item.quantity} ر.س</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
