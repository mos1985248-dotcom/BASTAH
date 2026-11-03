// components/marketplace/ProductCard.tsx
// بطاقة المنتج المشتركة: السوق، المتجر، المفضلة، المنتجات المشابهة، السلة.
"use client";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./card.module.css";

export interface MarketplaceProduct {
  id: string;
  nameAr: string;
  mainImage: string | null;
  price: number;
  comparePrice: number | null;
  avgRating: number;
  totalReviews: number;
  store: { id: string; nameAr: string; slug: string; city: string };
}

interface ProductCardProps {
  product: MarketplaceProduct;
  /** شارة اختيارية أعلى الصورة (مثال: "الأكثر مبيعاً") — لا تُعرض إن لم تُمرَّر */
  badge?: string;
  /** إظهار زر المفضلة أعلى الصورة — اختياري، لا يظهر بدون تمرير onToggleFavorite */
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export default function ProductCard({ product, badge, isFavorite, onToggleFavorite }: ProductCardProps) {
  const { price, comparePrice } = product;
  const discount =
    comparePrice && comparePrice > price ? Math.round((1 - price / comparePrice) * 100) : 0;

  return (
    <div className={s.wrap} style={uiVars}>
      <a href={`/products/${product.id}`} className={s.card}>
        <span
          className={s.media}
          style={product.mainImage ? { backgroundImage: `url(${product.mainImage})` } : undefined}
        >
          {!product.mainImage && <ShoppingBag size={40} strokeWidth={1.3} aria-hidden="true" />}
          {(badge || discount > 0) && (
            <span className={s.tags}>
              {badge && <span className={s.tag}>{badge}</span>}
              {discount > 0 && <span className={`${s.tag} ${s.tagSale}`}>خصم {discount}%</span>}
            </span>
          )}
        </span>

        <span className={s.body}>
          <span className={s.store}>
            {product.store.nameAr} · {product.store.city}
          </span>
          <span className={s.name}>
            {product.nameAr}
          </span>
          <span className={s.foot}>
            <span className={s.price}>
              {price}
              <small>ر.س</small>
              {discount > 0 && <span className={s.compare}>{comparePrice}</span>}
            </span>
            {product.totalReviews > 0 && (
              <span className={s.rating}>
                <Star size={14} strokeWidth={1.8} fill="currentColor" aria-hidden="true" />
                {product.avgRating.toFixed(1)} ({product.totalReviews})
              </span>
            )}
          </span>
        </span>
      </a>

      {onToggleFavorite && (
        <button
          type="button"
          className={`${s.fav} ${isFavorite ? s.favOn : ""}`}
          aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          aria-pressed={Boolean(isFavorite)}
          onClick={() => onToggleFavorite(product.id)}
        >
          <Heart size={18} strokeWidth={1.8} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
    </div>
  );
}
