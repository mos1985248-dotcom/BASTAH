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
  onQtyChange: (productId: string, variantId: string | null, qty: number) => void;
  onRemove: (productId: string, variantId: string | null) => void;
  onToggleFavorite: (productId: string) => void;
}) {
  const subtotal = items.reduce((s, i) => s + (i.variant?.price ?? i.product.price) * i.quantity, 0);
  const hasIssue = items.some((i) => i.product.status !== "ACTIVE" || (i.variant ? i.variant.quantity === 0 : i.product.quantity === 0));

  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ⚠️ نفس نقطة النهاية المستخدمة فعلياً بصفحة الدفع — لا حساب مستقل هنا
  useEffect(() => {
    if (!addressId || hasIssue) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    api
      .post<CheckoutPreview>("/api/checkout/preview", {
        storeId,
        items: items.map((i) => ({ productId: i.product.id, variantId: i.variantId ?? undefined, quantity: i.quantity })),
        addressId,
        paymentMethod: "CREDIT_CARD",
      })
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, addressId, hasIssue, items.map((i) => `${i.product.id}:${i.variantId}:${i.quantity}`).join(",")]);

  return (
    <div style={{ marginBottom: t.spacing["6"] }}>
      <div className="basita-cart-group-grid" style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: t.spacing["5"], alignItems: "start" }}>
        <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"] }}>
          <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, color: t.colors.primary[800], display: "flex", alignItems: "center", gap: 6 }}>
            <Store size={15} strokeWidth={1.8} />
            {storeName} <span style={{ color: t.colors.text.light, fontWeight: t.typography.fontWeight.regular, fontSize: t.typography.fontSize.sm }}>({items.length} {items.length === 1 ? "منتج" : "منتجات"})</span>
          </h3>

          <div style={{ borderTop: `1px solid ${t.colors.cream.border}` }}>
            {items.map((item) => (
              <div key={item.id} style={{ borderBottom: `1px solid ${t.colors.cream.borderLight}` }}>
                <CartItemRow
                  item={item}
                  busy={busyId === item.id}
                  isFavorite={favoriteIds.has(item.product.id)}
                  onQtyChange={(q) => onQtyChange(item.product.id, item.variantId, q)}
                  onRemove={() => onRemove(item.product.id, item.variantId)}
                  onToggleFavorite={() => onToggleFavorite(item.product.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <CartOrderSummaryCard storeId={storeId} subtotal={subtotal} preview={preview} previewLoading={previewLoading} hasAddress={!!addressId} disabled={hasIssue} />
      </div>

      <style>{`
        @media (max-width: 860px) {
          .basita-cart-group-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
