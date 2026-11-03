// components/cart/CartSummaryRow.tsx — سطر في ملخص الطلب
import s from "./summary.module.css";

export default function CartSummaryRow({
  label,
  value,
  freeLabel,
}: {
  label: string;
  value: number;
  freeLabel?: string;
}) {
  return (
    <div className={s.row}>
      <span>{label}</span>
      <span className={`${s.rowValue} ${value < 0 ? s.rowDiscount : ""}`}>
        {value === 0 && freeLabel ? freeLabel : `${value} ر.س`}
      </span>
    </div>
  );
}
