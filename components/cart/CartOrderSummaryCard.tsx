// components/cart/CartOrderSummaryCard.tsx
// عرض فقط: الحساب كله من /api/checkout/preview (CartStoreGroup) — لا حساب مستقل هنا.
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { t } from "@/theme";
import { CheckoutPreview } from "@/components/checkout/OrderPricingSummary";
import CartSummaryRow from "./CartSummaryRow";
import s from "./summary.module.css";

const PAYMENT_BADGES = ["مدى", "VISA", "Mastercard", "Apple Pay", "STC Pay"];

export default function CartOrderSummaryCard({
  storeId,
  subtotal,
  preview,
  previewLoading,
  hasAddress,
  disabled,
  couponField,
  discountAmount,
}: {
  storeId: string;
  subtotal: number;
  preview: CheckoutPreview | null;
  previewLoading: boolean;
  hasAddress: boolean;
  disabled: boolean;
  couponField?: ReactNode;
  discountAmount: number;
}) {
  const showPreview = hasAddress && preview;

  return (
    <aside className={s.card} aria-label="ملخص الطلب">
      <h2 className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>ملخص الطلب</h2>
      <p className={s.sub}>راجع تفاصيل طلبك قبل إتمام الشراء</p>

      {couponField}

      <div className={s.rows}>
        <CartSummaryRow label="المجموع الفرعي" value={subtotal} />
        {discountAmount > 0 && <CartSummaryRow label="الخصم" value={-discountAmount} />}
        {!hasAddress && (
          <p className={s.hint}>سيُحتسَب الشحن والضريبة عند اختيار عنوان الشحن بصفحة الدفع</p>
        )}
        {hasAddress && previewLoading && <p className={s.hint}>جاري حساب الشحن والضريبة…</p>}
        {showPreview && (
          <>
            <CartSummaryRow label="رسوم التوصيل" value={preview.shippingCost} freeLabel="مجاني" />
            {preview.codFee > 0 && <CartSummaryRow label="رسوم الدفع عند الاستلام" value={preview.codFee} />}
            {preview.taxAmount > 0 && <CartSummaryRow label="ضريبة القيمة المضافة (15٪)" value={preview.taxAmount} />}
          </>
        )}
      </div>

      <div className={s.total}>
        <span className={s.totalLabel}>الإجمالي الكلي</span>
        <span className={s.totalValue}>
          {showPreview ? preview.total : Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100)}
          <small>ر.س</small>
        </span>
      </div>
      {showPreview && preview.taxAmount > 0 && <p className={s.vatNote}>شامل ضريبة القيمة المضافة</p>}

      <div className={s.actions}>
        <a
          href={disabled ? undefined : `/checkout?store=${storeId}`}
          aria-disabled={disabled}
          className={s.checkout}
        >
          إتمام الطلب
        </a>
        {disabled && <p className={s.blocked}>أزل المنتجات غير المتاحة لمتابعة الطلب</p>}
        <a href="/marketplace" className={s.continue}>متابعة التسوّق</a>
      </div>

      <div className={s.pay}>
        <p className={s.payTitle}>
          <ShieldCheck size={15} strokeWidth={1.8} aria-hidden="true" />
          طرق دفع آمنة
        </p>
        <ul className={s.badges}>
          {PAYMENT_BADGES.map((b) => (
            <li key={b} className={s.badge}>{b}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
