// components/cart/CartStates.tsx — حالات السلة: تحميل، دخول مطلوب، فارغة، خطأ
import { AlertTriangle, ArrowLeft, ShoppingBag, ShoppingCart } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import Skeleton from "@/components/ui/Skeleton";
import c from "./cart.module.css";

export function CartLoading() {
  return (
    <div style={{ ...uiVars, display: "flex", flexDirection: "column", gap: 16 }} aria-busy="true">
      <Skeleton height={64} radius="24px" />
      <Skeleton height={220} radius="24px" />
    </div>
  );
}

export function CartLoginPrompt() {
  return (
    <div className={c.state} style={uiVars}>
      <ShoppingBag size={44} strokeWidth={1.4} aria-hidden="true" />
      <h1 className={c.stateTitle} style={{ fontFamily: t.typography.fontFamily.display }}>سلة التسوق</h1>
      <p className={c.stateText}>سجّل دخولك لعرض سلة التسوق</p>
      <a href="/login?redirect=/cart" className={c.cta}>
        تسجيل الدخول
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
      </a>
    </div>
  );
}

export function CartEmpty() {
  return (
    <div className={c.state} style={uiVars}>
      <ShoppingCart size={48} strokeWidth={1.4} aria-hidden="true" />
      <p className={c.stateTitle}>سلتك فارغة</p>
      <p className={c.stateText}>لم تُضف أي منتج بعد — تصفّح الأسر المنتجة واكتشف منتجاتهم</p>
      <a href="/marketplace" className={c.cta}>
        <ShoppingBag size={17} strokeWidth={1.8} aria-hidden="true" />
        تصفّح المنتجات
      </a>
    </div>
  );
}

export function CartError() {
  return (
    <p className={c.error} style={uiVars} role="alert">
      <AlertTriangle size={16} strokeWidth={1.8} aria-hidden="true" />
      حدث خطأ، حاول تحديث الصفحة
    </p>
  );
}
