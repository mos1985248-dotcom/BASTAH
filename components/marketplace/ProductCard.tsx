// components/marketplace/ProductCard.tsx
import { ShoppingBag, Star, Heart } from "lucide-react";
import { t } from "@/theme";

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
  return (
    <div style={{ position: "relative" }}>
      <a href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div
          className="basita-card-interactive"
          style={{
            background: t.colors.white,
            borderRadius: t.radius.lg,
            overflow: "hidden",
            border: `1px solid ${t.colors.cream.border}`,
          }}
        >
          <div
            style={{
              height: 150,
              position: "relative",
              background: product.mainImage
                ? `url(${product.mainImage}) center/cover`
                : `linear-gradient(135deg, ${t.colors.gold[700]}, ${t.colors.gold[600]})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            {!product.mainImage && <ShoppingBag size={36} strokeWidth={1.5} color="rgba(255,255,255,0.85)" />}
            {badge && (
              <span
                style={{
                  position: "absolute",
                  top: t.spacing["2"],
                  insetInlineStart: t.spacing["2"],
                  background: t.colors.gold[600],
                  color: t.colors.white,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  padding: "4px 10px",
                  borderRadius: t.radius.full,
                  boxShadow: t.shadows.gold,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <div style={{ padding: t.spacing["3"] }}>
            <p style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.primary[800] }}>
              {product.store.nameAr}
            </p>
            <p
              style={{
                margin: `0 0 ${t.spacing["2"]}`,
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.text.dark,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.nameAr}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: t.typography.fontSize.xs, color: t.colors.gold[600] }}>
                {product.totalReviews > 0 && (
                  <>
                    <Star size={11} strokeWidth={1.8} fill={t.colors.gold[600]} />
                    {product.avgRating.toFixed(1)} ({product.totalReviews})
                  </>
                )}
              </span>
              <span style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
                {product.price} ر.س
              </span>
            </div>
          </div>
        </div>
      </a>

      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(product.id);
          }}
          aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          className="basita-btn-interactive"
          style={{
            position: "absolute",
            top: t.spacing["2"],
            insetInlineEnd: t.spacing["2"],
            width: 30,
            height: 30,
            borderRadius: t.radius.full,
            border: "none",
            background: "rgba(255,255,255,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isFavorite ? t.colors.semantic.danger : t.colors.text.mid,
            boxShadow: t.shadows.sm,
          }}
        >
          <Heart size={14} strokeWidth={1.8} fill={isFavorite ? t.colors.semantic.danger : "none"} />
        </button>
      )}
    </div>
  );
}
