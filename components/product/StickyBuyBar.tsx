// components/product/StickyBuyBar.tsx — شريط الشراء الثابت (الجوال فقط)
import { uiVars } from "@/components/ui/vars";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import s from "./extras.module.css";

interface Props {
  qty: number;
  price: number;
  disabled: boolean;
  checkingOut: boolean;
  onBuyNow: () => void;
  onAddToCart: () => void;
  addingToCart: boolean;
  addedToCart: boolean;
  error: string;
}

export default function StickyBuyBar({ qty, price, disabled, checkingOut, onBuyNow, onAddToCart, addingToCart, addedToCart, error }: Props) {
  return (
    <div style={uiVars}>
      {error && <div role="alert" className={s.stickyError}>{error}</div>}
      <div className={s.sticky}>
        <button type="button" className={s.stickyCart} onClick={onAddToCart} disabled={disabled || addingToCart} aria-label={addedToCart ? "أُضيف للسلة" : "أضف إلى السلة"} title="أضف إلى السلة">
          {addingToCart ? <Loader2 size={21} aria-hidden="true" /> : addedToCart ? <Check size={21} aria-hidden="true" /> : <ShoppingCart size={21} aria-hidden="true" />}
        </button>
        <button type="button" className={s.stickyBuy} onClick={onBuyNow} disabled={disabled || addingToCart}>
          {checkingOut ? "جاري التحويل لصفحة الدفع..." : `اشترِ الآن — ${(price * qty).toFixed(2)} ر.س`}
        </button>
      </div>
    </div>
  );
}
