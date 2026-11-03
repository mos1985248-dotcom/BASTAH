// components/store/StoreProductRow.tsx
import ProductCard, { type MarketplaceProduct } from "@/components/marketplace/ProductCard";
import s from "./sections.module.css";

export default function StoreProductRow({
  title,
  subtitle,
  products,
  rankBadgeFirst,
  favoriteIds,
  onToggleFavorite,
}: {
  title: string;
  subtitle: string;
  products: MarketplaceProduct[];
  rankBadgeFirst?: string;
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  if (products.length === 0) return null;
  return (
    <div>
      <div className={s.rowHead}>
        <div>
          <h3 className={s.rowTitle}>{title}</h3>
          <p className={s.rowSub}>{subtitle}</p>
        </div>
        <span className={s.count}>{products.length} منتجات</span>
      </div>
      <div className={s.grid}>
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            badge={rankBadgeFirst && i === 0 ? rankBadgeFirst : undefined}
            isFavorite={favoriteIds.has(product.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
