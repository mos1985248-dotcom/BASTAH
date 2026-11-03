// components/product/ProductStates.tsx — حالتا التحميل والخطأ لصفحة المنتج
import { AlertTriangle } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import Skeleton from "@/components/ui/Skeleton";
import s from "./product.module.css";

export function ProductLoading() {
  return (
    <div className={s.page} style={{ ...uiVars, maxWidth: 1200 }} aria-busy="true">
      <div className={s.grid}>
        <Skeleton height={480} radius="28px" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="85%" height={32} />
          <Skeleton width="30%" height={16} />
          <Skeleton height={300} radius="28px" />
        </div>
      </div>
    </div>
  );
}

export function ProductError({ message }: { message: string }) {
  return (
    <div className={s.state} style={uiVars}>
      <div className={s.stateCard} role="alert">
        <AlertTriangle size={30} strokeWidth={1.8} color="var(--ui-danger)" aria-hidden="true" />
        <h1>{message ? "تعذّر تحميل المنتج" : "المنتج غير موجود"}</h1>
        <p>{message || "قد يكون الرابط غير صحيح أو أن المنتج لم يعد متاحًا."}</p>
        <a href="/marketplace">العودة إلى السوق</a>
      </div>
    </div>
  );
}
