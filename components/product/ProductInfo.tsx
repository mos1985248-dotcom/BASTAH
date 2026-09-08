// components/product/ProductInfo.tsx
import { t } from "@/theme";
import { shareContent } from "@/lib/share";
import { useState } from "react";
import { Store, BadgeCheck, Share2, Heart, Star, Hand, Leaf } from "lucide-react";
import { ProductDetail } from "./types";

export default function ProductInfo({
  product,
  isFavorite,
  onToggleFavorite,
}: {
  product: ProductDetail;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const result = await shareContent({ title: product.nameAr, text: product.descAr ?? product.nameAr });
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: t.spacing["2"] }}>
        <a
          href={`/store/${product.store.slug}`}
          style={{ display: "inline-flex", alignItems: "center", gap: t.spacing["1"], fontSize: t.typography.fontSize.sm, color: t.colors.primary[800], textDecoration: "none" }}
        >
          <Store size={14} strokeWidth={1.8} />
          {product.store.nameAr}
          {product.store.isVerified && <BadgeCheck size={13} strokeWidth={1.8} color={t.colors.primary[800]} />}
        </a>

        <div style={{ display: "flex", gap: t.spacing["2"] }}>
          <button
            onClick={handleShare}
            aria-label="مشاركة"
            style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: t.colors.text.mid }}
            title={copied ? "تم نسخ الرابط" : "مشاركة"}
          >
            <Share2 size={18} strokeWidth={1.8} />
          </button>
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: isFavorite ? t.colors.semantic.danger : t.colors.text.light }}
            >
              <Heart size={20} strokeWidth={1.8} fill={isFavorite ? t.colors.semantic.danger : "none"} />
            </button>
          )}
        </div>
      </div>

      <h1 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
        {product.nameAr}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: t.spacing["3"], marginBottom: t.spacing["3"], flexWrap: "wrap" }}>
        {product.totalReviews > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: t.typography.fontSize.sm, color: t.colors.gold[600] }}>
            <Star size={14} strokeWidth={2} fill={t.colors.gold[600]} />
            {product.avgRating.toFixed(1)} ({product.totalReviews} مراجعة)
          </span>
        )}
        {product.totalSold > 0 && (
          <span style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>· تم بيع {product.totalSold} قطعة</span>
        )}
        {product.isHandmade && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: t.typography.fontSize.xs, background: t.colors.primary[100], color: t.colors.primary[800], padding: "3px 10px", borderRadius: t.radius.full }}>
            <Hand size={12} strokeWidth={1.8} />
            صناعة يدوية
          </span>
        )}
      </div>

      {product.descAr && (
        <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed, margin: `0 0 ${t.spacing["3"]}` }}>
          {product.descAr}
        </p>
      )}

      {product.tags.length > 0 && (
        <div style={{ display: "flex", gap: t.spacing["2"], flexWrap: "wrap", marginBottom: t.spacing["4"] }}>
          {product.tags.map((tag) => (
            <span key={tag} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: t.typography.fontSize.xs, color: t.colors.text.body, background: t.colors.cream.warm, padding: "5px 12px", borderRadius: t.radius.full }}>
              <Leaf size={12} strokeWidth={1.8} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
