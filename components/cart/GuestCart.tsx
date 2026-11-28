"use client";

import { useState } from "react";
import GuestCheckoutForm from "@/components/product/GuestCheckoutForm";
import { lineKey, removePurchasedGuestLines, updateGuestCartLine, useGuestCart, type GuestCartLine } from "@/lib/guest-cart";
import s from "@/components/product/guest-checkout.module.css";

export default function GuestCart() {
  const lines = useGuestCart();
  const [checkout, setCheckout] = useState<GuestCartLine[]>([]);
  const [error, setError] = useState(false);
  const stores = new Map<string, GuestCartLine[]>();
  for (const line of lines) {
    const group = stores.get(line.storeId);
    if (group) group.push(line);
    else stores.set(line.storeId, [line]);
  }

  function mutate(action: () => void) {
    try { action(); setError(false); } catch { setError(true); }
  }

  return (
    <section className={s.form}>
      <h2>سلة التسوق</h2>
      <a href="/login?redirect=%2Fcart">تسجيل الدخول</a>
      {error && <p role="alert">تعذّر تحديث السلة في هذا المتصفح.</p>}
      {lines.length === 0 && checkout.length === 0 && <p>سلتك فارغة. <a href="/marketplace">تصفّح السوق</a></p>}
      {checkout.length > 0 ? (
        <>
          <button type="button" onClick={() => setCheckout([])}>العودة إلى السلة</button>
          <GuestCheckoutForm storeId={checkout[0].storeId} items={checkout} redirectPath="/cart"
            onComplete={() => mutate(() => removePurchasedGuestLines(checkout))} />
        </>
      ) : Array.from(stores, ([storeId, items]) => (
        <section key={storeId} className={s.form}>
          <h3>{items[0].storeName}</h3>
          <ul>
            {items.map((item) => (
              <li key={lineKey(item)}>
                <a href={`/products/${item.productId}`}>{item.name}</a>
                <label>الكمية
                  <select value={item.quantity} onChange={(event) => mutate(() => updateGuestCartLine(item, Number(event.target.value)))}>
                    {Array.from({ length: Math.min(item.maxQuantity, 99) }, (_, index) =>
                      <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                  </select>
                </label>
                <button type="button" onClick={() => mutate(() => updateGuestCartLine(item, 0))}>حذف</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setCheckout(items)}>أكمل طلب هذا المتجر</button>
        </section>
      ))}
    </section>
  );
}
