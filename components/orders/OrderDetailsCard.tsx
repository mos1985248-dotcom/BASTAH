// components/orders/OrderDetailsCard.tsx
import { ReceiptText } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import type { OrderDetail } from "./types";
import c from "./order.module.css";

export default function OrderDetailsCard({ order }: { order: OrderDetail }) {
  return (
    <section className={c.card} style={uiVars} aria-labelledby="order-details-title">
      <div className={c.cardHead}>
        <ReceiptText size={19} strokeWidth={1.7} aria-hidden="true" />
        <h2 id="order-details-title" className={c.cardTitle}>تفاصيل الطلب</h2>
      </div>
      <div className={c.cardBody}>
        <ul className={c.items}>
          {order.items.map((it, i) => (
            <li key={i} className={c.item}>
              <span>
                {it.nameAr} <span className={c.itemQty}>× {it.quantity}</span>
              </span>
              <span className={c.itemTotal}>{it.total} ر.س</span>
            </li>
          ))}
        </ul>
        <div className={c.rows}>
          <Row label="المجموع الفرعي" value={order.subtotal} />
          <Row label="التوصيل" value={order.shippingCost} freeLabel="مجاني" />
          {order.codFee > 0 && <Row label="رسوم الدفع عند الاستلام" value={order.codFee} />}
          {order.discountAmount > 0 && <Row label="الخصم" value={-order.discountAmount} />}
          {order.taxAmount > 0 && <Row label="ضريبة القيمة المضافة (15٪)" value={order.taxAmount} />}
          <div className={c.total}>
            <span className={c.totalLabel}>الإجمالي</span>
            <span className={c.totalValue}>{order.total} ر.س</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, freeLabel }: { label: string; value: number; freeLabel?: string }) {
  return (
    <div className={c.row}>
      <span>{label}</span>
      <span className={`${c.rowValue} ${value < 0 ? c.discount : ""}`}>
        {value === 0 && freeLabel ? freeLabel : `${value} ر.س`}
      </span>
    </div>
  );
}
