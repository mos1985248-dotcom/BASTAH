// components/checkout/OrderSummary.tsx
import { ClipboardList } from "lucide-react";
import { t } from "@/theme";
import { CartItemData } from "@/components/cart/types";
import OrderPricingSummary, { CheckoutPreview } from "./OrderPricingSummary";

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
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], display: "flex", alignItems: "center", gap: 6 }}>
        <ClipboardList size={16} strokeWidth={1.8} />
        ملخص الطلب — {storeName}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
        {items.map((i) => (
          <div key={i.id} style={{ display: "flex", gap: t.spacing["2"], alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: t.radius.md,
                background: i.product.mainImage ? `url(${i.product.mainImage}) center/cover` : t.colors.gold[100],
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {i.product.nameAr}
              </p>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.light }}>× {i.quantity}</p>
            </div>
            <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.body, flexShrink: 0 }}>
              {i.product.price * i.quantity} ر.س
            </span>
          </div>
        ))}
      </div>

      <OrderPricingSummary preview={preview} loading={previewLoading} />
    </div>
  );
}
