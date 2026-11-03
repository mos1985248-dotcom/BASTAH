// components/checkout/OrderSummary.tsx
import { ClipboardList, Package } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import { CartItemData } from "@/components/cart/types";
import OrderPricingSummary, { CheckoutPreview } from "./OrderPricingSummary";
import c from "./checkout.module.css";
import s from "./summary.module.css";

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
    <section className={c.card} style={uiVars} aria-labelledby="order-summary-title">
      <div className={c.cardHead}>
        <span className={c.cardIcon}><ClipboardList size={19} strokeWidth={1.7} aria-hidden="true" /></span>
        <div>
          <h2 id="order-summary-title" className={c.cardTitle}>ملخص الطلب</h2>
          <p className={c.cardSub}>
            {items.length} {items.length === 1 ? "منتج" : "منتجات"}
          </p>
        </div>
      </div>
      <div className={c.cardBody}>
        <p className={s.store}>من متجر: <strong>{storeName}</strong></p>
        <ul className={s.items}>
          {items.map((i) => {
            const image = i.variant?.image ?? i.product.mainImage;
            const price = i.variant?.price ?? i.product.price;
            return (
              <li key={i.id} className={s.item}>
                <span className={s.thumb} style={image ? { backgroundImage: `url(${image})` } : undefined} aria-hidden="true">
                  {!image && <Package size={22} strokeWidth={1.5} />}
                </span>
                <span>
                  <span className={s.name} title={i.product.nameAr}>{i.product.nameAr}</span>
                  <span className={s.qty}>الكمية: {i.quantity}</span>
                </span>
                <span className={s.line}>{price * i.quantity} ر.س</span>
              </li>
            );
          })}
        </ul>
        <OrderPricingSummary preview={preview} loading={previewLoading} />
      </div>
    </section>
  );
}
