// components/product/StickyBuyBar.tsx — شريط الشراء الثابت (الجوال فقط)
import { uiVars } from "@/components/ui/vars";
import QuantityStepper from "./QuantityStepper";
import s from "./extras.module.css";

interface Props {
  qty: number;
  maxQty: number;
  onQtyChange: (q: number) => void;
  price: number;
  disabled: boolean;
  checkingOut: boolean;
  onBuyNow: () => void;
  error: string;
}

export default function StickyBuyBar({ qty, maxQty, onQtyChange, price, disabled, checkingOut, onBuyNow, error }: Props) {
  return (
    <div style={uiVars}>
      {error && <div role="alert" className={s.stickyError}>{error}</div>}
      <div className={s.sticky}>
        <QuantityStepper qty={qty} maxQty={maxQty} onChange={onQtyChange} disabled={disabled} />
        <button type="button" className={s.stickyBuy} onClick={onBuyNow} disabled={disabled}>
          {checkingOut ? "جاري التحويل لصفحة الدفع..." : `اشترِ الآن — ${(price * qty).toFixed(2)} ر.س`}
        </button>
      </div>
    </div>
  );
}
