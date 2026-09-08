// components/product/ProductPurchasePanel.tsx
import { t } from "@/theme";
import { XCircle, CheckCircle2, AlertTriangle, ShoppingCart, Zap, Lock } from "lucide-react";
import ProductVariantSelector from "./ProductVariantSelector";
import ProductTrustBar from "./ProductTrustBar";
import ProductPolicyCards from "./ProductPolicyCards";
import { ProductDetail, ProductVariantItem } from "./types";

interface Props {
  product: ProductDetail;
  selectedVariant: ProductVariantItem | null;
  onSelectVariant: (id: string) => void;
  qty: number;
  onQtyChange: (q: number) => void;
  maxQty: number;
  effectivePrice: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  addingToCart: boolean;
  addedToCart: boolean;
  checkingOut: boolean;
  error: string;
}

export default function ProductPurchasePanel({
  product, selectedVariant, onSelectVariant, qty, onQtyChange, maxQty,
  effectivePrice, onAddToCart, onBuyNow, addingToCart, addedToCart, checkingOut, error,
}: Props) {
  const discount = product.comparePrice ? Math.round(((product.comparePrice - effectivePrice) / product.comparePrice) * 100) : 0;
  const outOfStock = maxQty === 0;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["5"] }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: t.spacing["3"], marginBottom: t.spacing["1"] }}>
        <span style={{ fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          {effectivePrice} ر.س
        </span>
        {product.comparePrice && product.comparePrice > effectivePrice && (
          <>
            <span style={{ fontSize: t.typography.fontSize.md, color: t.colors.text.light, textDecoration: "line-through" }}>
              {product.comparePrice} ر.س
            </span>
            <span style={{ fontSize: t.typography.fontSize.xs, background: t.colors.semantic.dangerBg, color: t.colors.semantic.danger, padding: "3px 8px", borderRadius: t.radius.sm }}>
              خصم {discount}٪
            </span>
          </>
        )}
      </div>

      <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: outOfStock ? t.colors.semantic.danger : t.colors.semantic.success, margin: `0 0 ${t.spacing["4"]}` }}>
        {outOfStock ? <XCircle size={15} strokeWidth={2} /> : <CheckCircle2 size={15} strokeWidth={2} />}
        {outOfStock ? "نفدت الكمية" : `${maxQty} قطعة متوفرة`}
      </p>

      <ProductVariantSelector variants={product.variants} selectedId={selectedVariant?.id ?? null} onSelect={onSelectVariant} basePrice={product.price} />

      <div style={{ marginBottom: t.spacing["4"] }}>
        <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>الكمية</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: t.spacing["3"], background: t.colors.cream.bg, borderRadius: t.radius.full, padding: "4px 8px" }}>
          <button
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            disabled={outOfStock}
            style={{ width: 32, height: 32, borderRadius: t.radius.full, border: "none", background: t.colors.white, cursor: outOfStock ? "not-allowed" : "pointer", fontSize: 16 }}
          >
            −
          </button>
          <span style={{ fontSize: t.typography.fontSize.base, minWidth: 20, textAlign: "center" }}>{qty}</span>
          <button
            onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
            disabled={outOfStock || qty >= maxQty}
            style={{ width: 32, height: 32, borderRadius: t.radius.full, border: "none", background: t.colors.primary[800], color: t.colors.white, cursor: outOfStock || qty >= maxQty ? "not-allowed" : "pointer", fontSize: 16 }}
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, margin: `0 0 ${t.spacing["3"]}` }}>
          <AlertTriangle size={13} strokeWidth={1.8} />
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        <button
          onClick={onAddToCart}
          disabled={addingToCart || outOfStock}
          style={{
            width: "100%",
            padding: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: addedToCart ? t.colors.semantic.success : t.colors.cream.warm,
            color: addedToCart ? t.colors.white : t.colors.primary[800],
            border: `1.5px solid ${addedToCart ? t.colors.semantic.success : t.colors.primary[800]}`,
            borderRadius: t.radius.md,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            cursor: addingToCart || outOfStock ? "not-allowed" : "pointer",
          }}
        >
          {addedToCart ? (
            <>
              <CheckCircle2 size={16} strokeWidth={2} />
              أُضيف للسلة
            </>
          ) : addingToCart ? (
            "جاري الإضافة..."
          ) : (
            <>
              <ShoppingCart size={16} strokeWidth={1.8} />
              أضف إلى السلة
            </>
          )}
        </button>

        <button
          onClick={onBuyNow}
          disabled={checkingOut || outOfStock}
          style={{
            width: "100%",
            padding: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: checkingOut ? t.colors.primary[600] : t.colors.primary[800],
            color: t.colors.text.onDark,
            border: "none",
            borderRadius: t.radius.md,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            cursor: checkingOut || outOfStock ? "not-allowed" : "pointer",
          }}
        >
          {checkingOut ? (
            "جاري التحويل لصفحة الدفع..."
          ) : (
            <>
              <Zap size={16} strokeWidth={1.8} fill={t.colors.text.onDark} />
              اشترِ الآن
            </>
          )}
        </button>

        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", fontSize: t.typography.fontSize.xs, color: t.colors.text.light, margin: `${t.spacing["1"]} 0 0` }}>
          <Lock size={12} strokeWidth={1.8} />
          تسوقي بثقة وأمان
        </p>
      </div>

      <ProductTrustBar />
      <ProductPolicyCards product={product} />
    </div>
  );
}
