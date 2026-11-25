"use client";

import { useId, useState } from "react";
import type { useCheckoutCoupon } from "@/hooks/useCheckoutCoupon";
import s from "@/components/cart/summary.module.css";

export default function CheckoutCouponField({ coupon, disabled = false }: {
  coupon: ReturnType<typeof useCheckoutCoupon>;
  disabled?: boolean;
}) {
  const [code, setCode] = useState("");
  const id = useId();
  return (
    <form className={s.couponForm} onSubmit={event => { event.preventDefault(); void coupon.apply(code.trim()); }}>
      <label htmlFor={id} className={s.couponLabel}>كود الخصم</label>
      <div className={s.coupon}>
        <input id={id} value={code} onChange={event => setCode(event.target.value)} maxLength={32} disabled={disabled || !coupon.available}
          autoComplete="off" dir="ltr" className={s.couponInput} placeholder="اكتب كود الخصم" />
        <button className={s.couponBtn} disabled={disabled || !coupon.available || coupon.busy || code.trim().length < 3}>تطبيق</button>
      </div>
      {coupon.savedCode && <p className={s.couponNote}>{coupon.quote ? "تم تطبيق" : "الكوبون المحفوظ"} <bdi>{coupon.savedCode}</bdi>{" "}
        <button type="button" className={s.couponBtn} onClick={coupon.clear} disabled={disabled}>إزالة</button>
      </p>}
      {coupon.error && <p className={s.couponNote} role="alert">{coupon.error}</p>}
    </form>
  );
}
