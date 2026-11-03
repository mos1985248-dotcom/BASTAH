// components/product/ProductPurchasePanel.tsx
// عرض فقط: منطق الشراء كله في hooks/useProductPurchase (لم يتغيّر).
import { AlertTriangle, Check, Loader2, ShoppingBag } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import ProductTrustBar from "./ProductTrustBar";
import ProductVariantSelector from "./ProductVariantSelector";
import QuantityStepper from "./QuantityStepper";
import type { ProductDetail, ProductVariantItem } from "./types";
import s from "./buy.module.css";

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

export default function ProductPurchasePanel(p: Props) {
  const { product, selectedVariant, effectivePrice, maxQty } = p;
  const hasCompare = Boolean(product.comparePrice && product.comparePrice > effectivePrice);
  const discount = hasCompare
    ? Math.round(((product.comparePrice! - effectivePrice) / product.comparePrice!) * 100)
    : 0;
  const outOfStock = maxQty === 0;
  const busy = p.addingToCart || p.checkingOut;

  const stockClass = outOfStock ? s.stockOut : maxQty <= 5 ? s.stockLow : "";
  const stockText = outOfStock
    ? selectedVariant
      ? "غير متوفر بهذا الخيار"
      : "نفدت الكمية"
    : `${maxQty} قطعة متوفرة`;

  return (
    <div className={s.panel} style={uiVars}>
      <div className={s.priceRow}>
        <span className={s.price}>{effectivePrice}</span>
        <span className={s.unit}>ر.س</span>
        {hasCompare && <span className={s.compare}>{product.comparePrice} ر.س</span>}
        {discount > 0 && <span className={s.sale}>خصم {discount}٪</span>}
      </div>
      <span className={`${s.stock} ${stockClass}`}>{stockText}</span>

      {product.variants.length > 0 && (
        <div className={s.block}>
          <ProductVariantSelector
            variants={product.variants}
            selectedId={selectedVariant?.id ?? null}
            onSelect={p.onSelectVariant}
            basePrice={product.price}
          />
        </div>
      )}

      <div className={s.block}>
        <span className={s.label}>الكمية</span>
        <QuantityStepper qty={p.qty} maxQty={maxQty} onChange={p.onQtyChange} disabled={outOfStock} />
      </div>

      {p.error && (
        <div className={s.alert} role="alert">
          <AlertTriangle size={16} strokeWidth={1.9} aria-hidden="true" />
          <span>{p.error}</span>
        </div>
      )}

      <div className={s.buttons}>
        <button type="button" className={`${s.btn} ${s.btnBuy}`} onClick={p.onBuyNow} disabled={outOfStock || busy}>
          {p.checkingOut && <Loader2 size={18} strokeWidth={2} aria-hidden="true" />}
          {p.checkingOut ? "جاري التحويل لصفحة الدفع..." : "اشترِ الآن"}
        </button>
        <button type="button" className={`${s.btn} ${s.btnCart}`} onClick={p.onAddToCart} disabled={outOfStock || busy}>
          {p.addedToCart ? <Check size={18} strokeWidth={2.2} aria-hidden="true" /> : <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />}
          {p.addingToCart ? "جاري الإضافة..." : p.addedToCart ? "أُضيف للسلة" : "أضف إلى السلة"}
        </button>
        {p.addedToCart && (
          <a href="/cart" className={s.cartLink}>
            الانتقال إلى السلة ←
          </a>
        )}
      </div>

      <p className={s.assure}>تسوّق بثقة وأمان</p>
      <ProductTrustBar />
    </div>
  );
}
