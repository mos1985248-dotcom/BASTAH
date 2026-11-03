// components/checkout/CheckoutConfirmPanel.tsx
import { AlertTriangle, Lock } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./pay.module.css";

interface Props {
  agreedToTerms: boolean;
  onAgreeChange: (v: boolean) => void;
  placing: boolean;
  placeError: string;
  paymentMethod: string;
  onConfirm: () => void;
}

export default function CheckoutConfirmPanel({
  agreedToTerms,
  onAgreeChange,
  placing,
  placeError,
  paymentMethod,
  onConfirm,
}: Props) {
  const isDisabled = placing || !agreedToTerms;
  const label = placing
    ? "جاري تأكيد طلبك..."
    : paymentMethod === "CASH_ON_DELIVERY" || paymentMethod === "BANK_TRANSFER"
      ? "تأكيد الطلب"
      : "تأكيد الطلب والدفع";

  return (
    <section className={s.confirm} style={uiVars} aria-label="تأكيد الطلب">
      {placeError && (
        <div className={s.err} role="alert">
          <AlertTriangle size={17} strokeWidth={1.9} aria-hidden="true" />
          <span>{placeError}</span>
        </div>
      )}

      <label className={s.terms}>
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => onAgreeChange(e.target.checked)}
          aria-label="الموافقة على الشروط والأحكام وسياسة الخصوصية"
        />
        <span>
          أوافق على{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">الشروط والأحكام</a>
          {" "}و{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">سياسة الخصوصية</a>
        </span>
      </label>

      <button type="button" className={s.confirmBtn} onClick={onConfirm} disabled={isDisabled} aria-disabled={isDisabled}>
        <Lock size={18} strokeWidth={1.9} aria-hidden="true" />
        {label}
      </button>

      <p className={s.secure}>
        <Lock size={13} strokeWidth={1.8} aria-hidden="true" />
        بالضغط على الزر، أنت توافق على الشروط والأحكام
      </p>
    </section>
  );
}
