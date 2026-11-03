// components/product/ProductInfo.tsx
"use client";
import { useState } from "react";
import { BadgeCheck, Check, Heart, Share2, Star } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import Badge from "@/components/ui/Badge";
import { shareContent } from "@/lib/share";
import type { ProductDetail } from "./types";
import s from "./buy.module.css";

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
    <div className={s.info} style={uiVars}>
      <div className={s.topRow}>
        <a href={`/store/${product.store.slug}`} className={s.storeLink}>
          {product.store.nameAr}
          {product.store.isVerified && <BadgeCheck size={16} strokeWidth={1.9} aria-label="متجر موثّق" />}
        </a>
        <div className={s.tools}>
          <button type="button" className={s.iconBtn} onClick={handleShare} aria-label={copied ? "تم نسخ الرابط" : "مشاركة"}>
            {copied ? <Check size={18} strokeWidth={2} /> : <Share2 size={18} strokeWidth={1.8} />}
          </button>
          {onToggleFavorite && (
            <button
              type="button"
              className={`${s.iconBtn} ${isFavorite ? s.iconOn : ""}`}
              onClick={onToggleFavorite}
              aria-pressed={Boolean(isFavorite)}
              aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            >
              <Heart size={18} strokeWidth={1.8} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      <h1 className={s.name}>{product.nameAr}</h1>

      <div className={s.meta}>
        {product.totalReviews > 0 && (
          <span className={s.rating}>
            <Star size={16} strokeWidth={1.8} fill="currentColor" aria-hidden="true" />
            {product.avgRating.toFixed(1)}
            <span style={{ fontWeight: 400, color: "var(--ui-ink-muted)" }}>({product.totalReviews} مراجعة)</span>
          </span>
        )}
        {product.totalSold > 0 && <span>تم بيع {product.totalSold} قطعة</span>}
        {product.isHandmade && <Badge tone="gold">صناعة يدوية</Badge>}
      </div>
    </div>
  );
}
