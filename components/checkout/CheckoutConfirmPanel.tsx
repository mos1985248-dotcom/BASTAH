// components/checkout/CheckoutConfirmPanel.tsx
import { AlertTriangle, Lock } from "lucide-react";
import { t } from "@/theme";

interface Props {
  agreedToTerms: boolean;
  onAgreeChange: (v: boolean) => void;
  placing: boolean;
  placeError: string;
  paymentMethod: string;
  onConfirm: () => void;
}

export default function CheckoutConfirmPanel({ agreedToTerms, onAgreeChange, placing, placeError, paymentMethod, onConfirm }: Props) {
  return (
    <>
      <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"] }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: t.spacing["2"], cursor: "pointer" }}>
          <input type="checkbox" checked={agreedToTerms} onChange={(e) => onAgreeChange(e.target.checked)} style={{ marginTop: 3 }} />
          <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
            أوافق على <a href="/terms" style={{ color: t.colors.primary[800] }}>الشروط والأحكام</a> و<a href="/privacy" style={{ color: t.colors.primary[800] }}>سياسة الخصوصية</a>
          </span>
        </label>
      </div>

      {placeError && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.sm, background: t.colors.semantic.dangerBg, padding: t.spacing["3"], borderRadius: t.radius.md, margin: 0 }}>
          <AlertTriangle size={15} strokeWidth={1.8} />
          {placeError}
        </p>
      )}

      <button
        onClick={onConfirm}
        disabled={placing || !agreedToTerms}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 15,
          background: placing || !agreedToTerms ? t.colors.primary[600] : t.colors.primary[800],
          color: t.colors.white,
          border: "none",
          borderRadius: t.radius.lg,
          fontSize: t.typography.fontSize.base,
          fontWeight: t.typography.fontWeight.bold,
          cursor: placing || !agreedToTerms ? "not-allowed" : "pointer",
          opacity: !agreedToTerms ? 0.7 : 1,
        }}
      >
        <Lock size={16} strokeWidth={1.8} />
        {placing ? "جاري تأكيد طلبك..." : paymentMethod === "CASH_ON_DELIVERY" || paymentMethod === "BANK_TRANSFER" ? "تأكيد الطلب" : "تأكيد الطلب والدفع"}
      </button>
      <p style={{ textAlign: "center", fontSize: t.typography.fontSize.xs, color: t.colors.text.light, margin: 0 }}>
        بالضغط على الزر، أنت توافقين على الشروط والأحكام
      </p>
    </>
  );
}
