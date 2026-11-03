// components/dashboard/ui/LoadingState.tsx — حالة تحميل بهوية لوحة التاجر (نفس واجهة admin/ui/LoadingState)
import { Loader2 } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

export default function LoadingState({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <div className={s.center} style={uiVars} role="status" aria-busy="true">
      <Loader2 size={20} strokeWidth={1.8} className={s.spin} aria-hidden="true" />
      {label}
    </div>
  );
}
