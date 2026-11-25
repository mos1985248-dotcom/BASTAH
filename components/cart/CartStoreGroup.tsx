// components/cart/CartStoreGroup.tsx
// المنطق (حساب المجموع وكشف المشكلات ومعاينة الشحن/الضريبة) كما كان حرفياً؛ التغيير في العرض فقط.
import { useEffect, useMemo, useState } from "react";
import { useCheckoutCoupon } from "@/hooks/useCheckoutCoupon";
import CheckoutCouponField from "@/components/checkout/CheckoutCouponField";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import CartItemRow from "./CartItemRow";
import CartOrderSummaryCard from "./CartOrderSummaryCard";
import { CartItemData } from "./types";
import { CheckoutPreview } from "@/components/checkout/OrderPricingSummary";
import c from "./cart.module.css";

export default function CartStoreGroup({
  storeId,
  couponsAvailable,
  onDiscountChange,
  storeName,
  storeSlug,
  items,
  busyId,
  favoriteIds,
  addressId,
  onQtyChange,
  onRemove,
  onToggleFavorite,
}: {
  storeId: string;
  couponsAvailable: boolean;
  onDiscountChange: (storeId: string, amount: number) => void;
  storeName: string;
  storeSlug: string;
  items: CartItemData[];
  busyId: string | null;
  favoriteIds: Set<string>;
  addressId: string;
  onQtyChange: (productId: string, variantId: string | null, qty: number) => void;
  onRemove: (productId: string, variantId: string | null) => void;
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

  const orderItems = useMemo(() => items.map(({ product, variantId, quantity }) => ({
    productId: product.id, variantId: variantId ?? undefined, quantity,
  })), [items]);
  const coupon = useCheckoutCoupon(storeId, orderItems, couponsAvailable);
  const couponCode = coupon.quote?.couponCode;
  const discountAmount = coupon.quote?.discountAmount ?? 0;
  useEffect(() => { onDiscountChange(storeId, discountAmount); }, [storeId, discountAmount, onDiscountChange]);

  useEffect(() => {
    setPreview(null);
    if (!addressId || hasIssue) {
      setPreviewLoading(false);
      return;
    }
    let current = true;
    setPreviewLoading(true);
    api.post<CheckoutPreview>("/api/checkout/preview", {
      storeId, items: orderItems, couponCode, addressId, paymentMethod: "CREDIT_CARD",
    }).then(data => { if (current) setPreview(data); })
      .catch(() => { if (current) setPreview(null); })
      .finally(() => { if (current) setPreviewLoading(false); });
    return () => { current = false; };
  }, [storeId, addressId, hasIssue, orderItems, couponCode]);

  return (
    <section dir="rtl" className={c.group} style={uiVars} aria-labelledby={`cart-store-${storeId}`}>
      <div className={c.groupGrid}>
        <div className={c.products}>
          <div className={c.groupHead}>
            <div className={c.storeId}>
              <span className={c.storeMark} aria-hidden="true" style={{ fontFamily: t.typography.fontFamily.display }}>
                {storeName.trim().charAt(0)}
              </span>
              <h2 id={`cart-store-${storeId}`} className={c.storeName}>
                <a href={`/store/${storeSlug}`}>{storeName}</a>
                <span className={c.storeCount}>
                  {items.length} {items.length === 1 ? "منتج" : "منتجات"} في السلة
                </span>
              </h2>
            </div>
            <span className={c.pill}>متجر واحد</span>
          </div>

          <ul className={c.list}>
            {items.map((item) => (
              <li key={item.id}>
                <CartItemRow
                  item={item}
                  busy={busyId === item.id}
                  isFavorite={favoriteIds.has(item.product.id)}
                  onQtyChange={(qty) => onQtyChange(item.product.id, item.variantId, qty)}
                  onRemove={() => onRemove(item.product.id, item.variantId)}
                  onToggleFavorite={() => onToggleFavorite(item.product.id)}
                />
              </li>
            ))}
          </ul>
        </div>

        <CartOrderSummaryCard
          storeId={storeId}
          subtotal={subtotal}
          preview={preview}
          previewLoading={previewLoading}
          hasAddress={!!addressId}
          discountAmount={discountAmount}
          couponField={couponsAvailable || coupon.savedCode ? <CheckoutCouponField coupon={coupon} disabled={hasIssue} /> : undefined}
          disabled={hasIssue}
        />
      </div>
    </section>
  );
}
