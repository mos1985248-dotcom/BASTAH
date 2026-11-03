// components/product/QuantityStepper.tsx — مشترك بين لوحة الشراء والشريط الثابت
import { Minus, Plus } from "lucide-react";
import s from "./buy.module.css";

export default function QuantityStepper({
  qty,
  maxQty,
  onChange,
  disabled,
}: {
  qty: number;
  maxQty: number;
  onChange: (q: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={s.qty} role="group" aria-label="الكمية">
      <button type="button" className={s.qtyBtn} onClick={() => onChange(Math.max(1, qty - 1))} disabled={disabled || qty <= 1} aria-label="تقليل الكمية">
        <Minus size={16} strokeWidth={2} />
      </button>
      <span className={s.qtyVal} aria-live="polite">{qty}</span>
      <button type="button" className={s.qtyBtn} onClick={() => onChange(Math.min(maxQty, qty + 1))} disabled={disabled || qty >= maxQty} aria-label="زيادة الكمية">
        <Plus size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
