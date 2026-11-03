// components/marketplace/ProductGrid.tsx
import { AlertTriangle } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ProductCard, { MarketplaceProduct } from "./ProductCard";
import card from "./card.module.css";
import s from "./market.module.css";

export default function ProductGrid({
  products,
  loading,
  error,
  onRetry,
}: {
  products: MarketplaceProduct[];
  loading: boolean;
  error: string;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className={s.grid} style={uiVars} aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={card.skeleton}>
            <Skeleton height={200} radius="0" />
            <div className={card.skeletonBody}>
              <Skeleton height={12} width="45%" />
              <Skeleton height={16} />
              <Skeleton height={18} width="35%" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className={s.notice} style={uiVars} role="alert">
        <AlertTriangle size={26} strokeWidth={1.8} aria-hidden="true" />
        <p>{error}</p>
        {onRetry && (
          <button type="button" className={s.retry} onClick={onRetry}>
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <EmptyState title="لا توجد منتجات حالياً" description="جرّب تغيير القسم أو كلمة البحث." />
    );
  }
  return (
    <div className={s.grid} style={uiVars}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
