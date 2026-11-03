// components/checkout/OrderPricingSummary.tsx
// الأرقام كلها من /api/checkout/preview (نفس دوال /api/checkout) — لا حساب مستقل هنا.
import { Loader2 } from "lucide-react";
import s from "./summary.module.css";

export interface CheckoutPreview {
  subtotal: number;
  shippingCost: number;
  codFee: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export default function OrderPricingSummary({
  preview,
  loading,
}: {
  preview: CheckoutPreview | null;
  loading: boolean;
}) {
  if (!preview) {
    return loading ? (
      <div className={s.pricing}>
        <p className={s.calc} role="status">
          <Loader2 size={16} strokeWidth={2} aria-hidden="true" />
          جاري حساب التكلفة النهائية...
        </p>
      </div>
    ) : null;
  }

  return (
    <div className={`${s.pricing} ${loading ? s.dim : ""}`} aria-busy={loading}>
      <h3 className={s.pricingTitle}>ملخص التكلفة</h3>
      <div className={s.rows}>
        <Row label="المجموع الفرعي" value={preview.subtotal} />
        <Row label="التوصيل" value={preview.shippingCost} freeLabel="مجاني" />
        {preview.codFee > 0 && <Row label="رسوم الدفع عند الاستلام" value={preview.codFee} />}
        {preview.discountAmount > 0 && <Row label="الخصم" value={-preview.discountAmount} />}
        {preview.taxAmount > 0 && <Row label="ضريبة القيمة المضافة (15٪)" value={preview.taxAmount} />}
      </div>
      <div className={s.total}>
        <span className={s.totalLabel}>الإجمالي الكلي</span>
        <span className={s.totalValue}>{preview.total} ر.س</span>
      </div>
      {preview.taxAmount > 0 && <p className={s.vat}>شامل ضريبة القيمة المضافة</p>}
    </div>
  );
}

function Row({ label, value, freeLabel }: { label: string; value: number; freeLabel?: string }) {
  return (
    <div className={s.row}>
      <span>{label}</span>
      <span className={`${s.rowValue} ${value < 0 ? s.discount : ""}`}>
        {value === 0 && freeLabel ? freeLabel : `${value} ر.س`}
      </span>
    </div>
  );
}
