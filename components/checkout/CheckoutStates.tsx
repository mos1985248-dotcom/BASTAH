// components/checkout/CheckoutStates.tsx — حالات صفحة الدفع: لا متجر، تحميل، دخول مطلوب، سلة فارغة/خطأ
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import c from "./checkout.module.css";

export function NoStore() {
  return (
    <div className={`${c.state} ${c.stateErr}`} style={uiVars} role="alert">
      <AlertTriangle size={30} strokeWidth={1.7} aria-hidden="true" />
      <p className={c.stateTitle}>لم يتم تحديد المتجر</p>
      <p className={c.stateText}>ارجع إلى السلة واختر المتجر الذي تريد إتمام طلبه</p>
      <a href="/cart" className={c.cta}>العودة إلى السلة</a>
    </div>
  );
}

export function CheckoutLoading() {
  return (
    <div className={c.state} style={uiVars} role="status" aria-busy="true">
      <Loader2 size={30} strokeWidth={1.7} aria-hidden="true" />
      <p className={c.stateText}>جاري التحميل...</p>
    </div>
  );
}

export function CheckoutLogin({ storeId }: { storeId: string }) {
  return (
    <div className={c.state} style={uiVars}>
      <p className={c.stateTitle}>سجّل دخولك لإتمام الدفع</p>
      <a href={`/login?redirect=/checkout?store=${storeId}`} className={c.cta}>
        تسجيل الدخول
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
      </a>
    </div>
  );
}

export function CheckoutEmpty({ loadError }: { loadError: boolean }) {
  return (
    <div className={`${c.state} ${c.stateErr}`} style={uiVars} role="alert">
      <AlertTriangle size={30} strokeWidth={1.7} aria-hidden="true" />
      <p className={c.stateTitle}>{loadError ? "تعذّر تحميل السلة" : "لا توجد منتجات لهذا المتجر بسلتك"}</p>
      <a href="/cart" className={c.cta}>العودة إلى السلة</a>
    </div>
  );
}
