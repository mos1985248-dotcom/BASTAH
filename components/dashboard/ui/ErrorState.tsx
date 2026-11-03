// components/dashboard/ui/ErrorState.tsx — نفس واجهة admin/ui/ErrorState
import { AlertTriangle } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

export default function ErrorState({ message = "تعذّر تحميل البيانات", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className={`${s.center} ${s.centerCol}`} style={uiVars} role="alert">
      <p className={s.err} style={{ margin: 0 }}>
        <AlertTriangle size={15} strokeWidth={1.8} aria-hidden="true" />
        {message}
      </p>
      {onRetry && <button type="button" onClick={onRetry} className={`${s.btnSm} ${s.btnDanger}`}>إعادة المحاولة</button>}
    </div>
  );
}
