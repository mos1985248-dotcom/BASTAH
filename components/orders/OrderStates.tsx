// components/orders/OrderStates.tsx — حالتا الخطأ والتحميل لصفحة الطلب
import { AlertTriangle, Loader2 } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import c from "./order.module.css";

export function OrderError({ message }: { message: string }) {
  return (
    <div className={`${c.state} ${c.stateErr}`} style={{ ...uiVars, maxWidth: 520 }} role="alert">
      <AlertTriangle size={30} strokeWidth={1.7} aria-hidden="true" />
      <p className={c.stateText}>{message}</p>
      <a href="/marketplace" className={c.cta}>متابعة التسوّق</a>
    </div>
  );
}

export function OrderLoading() {
  return (
    <div className={c.state} style={{ ...uiVars, maxWidth: 520 }} role="status" aria-busy="true">
      <Loader2 size={30} strokeWidth={1.7} aria-hidden="true" />
      <p className={c.stateText}>جاري التحميل...</p>
    </div>
  );
}
