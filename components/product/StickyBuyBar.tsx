// components/product/StickyBuyBar.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

export default function StickyBuyBar({
  qty,
  maxQty,
  onQtyChange,
  price,
  disabled,
  checkingOut,
  onBuyNow,
  error,
}: {
  qty: number;
  maxQty: number;
  onQtyChange: (q: number) => void;
  price: number;
  disabled: boolean;
  checkingOut: boolean;
  onBuyNow: () => void;
  error: string;
}) {
  return (
    <>
      {error && (
        <p
          style={{
            position: "fixed",
            bottom: 74,
            insetInlineStart: 0,
            insetInlineEnd: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
            background: t.colors.white,
            padding: t.spacing["1"],
            margin: 0,
          }}
        >
          <AlertTriangle size={13} strokeWidth={1.8} />
          {error}
        </p>
      )}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          insetInlineStart: 0,
          insetInlineEnd: 0,
          background: t.colors.white,
          padding: t.spacing["3"],
          borderTop: `1px solid ${t.colors.cream.border}`,
          display: "flex",
          gap: t.spacing["3"],
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: t.spacing["2"], background: t.colors.cream.bg, borderRadius: t.radius.full, padding: "0 6px" }}>
          <button
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            style={{ width: 30, height: 30, borderRadius: t.radius.full, border: "none", background: t.colors.white, cursor: "pointer" }}
          >
            −
          </button>
          <span style={{ fontSize: t.typography.fontSize.sm, minWidth: 16, textAlign: "center" }}>{qty}</span>
          <button
            onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
            style={{ width: 30, height: 30, borderRadius: t.radius.full, border: "none", background: t.colors.primary[800], color: t.colors.text.onDark, cursor: "pointer" }}
          >
            +
          </button>
        </div>
        <button
          onClick={onBuyNow}
          disabled={disabled}
          style={{
            flex: 1,
            padding: "13px",
            background: checkingOut ? t.colors.primary[600] : t.colors.primary[800],
            color: t.colors.text.onDark,
            border: "none",
            borderRadius: t.radius.lg,
            fontWeight: t.typography.fontWeight.bold,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {checkingOut ? "جاري التحويل لصفحة الدفع..." : `اشتري الآن — ${(price * qty).toFixed(2)} ر.س`}
        </button>
      </div>
    </>
  );
}
