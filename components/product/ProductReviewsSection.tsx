// components/product/ProductReviewsSection.tsx
// المعدّل والتوزيع والمراجعات حقيقية فقط؛ عند غيابها تظهر حالة فارغة صادقة.
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ReviewsSummary from "@/components/store/ReviewsSummary";
import s from "@/components/store/reviews.module.css";
import g from "./gallery.module.css";
import p from "./product.module.css";
import ProductReviewCard from "./ProductReviewCard";
import { useProductReviews } from "./useProductReviews";
import type { ProductDetail } from "./types";

export default function ProductReviewsSection({ product }: { product: ProductDetail }) {
  const { meta, reviews, loading, page, hasMore, loadMore } = useProductReviews(product.id);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const total = meta?.totalReviews ?? product.totalReviews;
  const avg = meta?.avgRating ?? product.avgRating;

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <section aria-labelledby="product-reviews-title" style={uiVars}>
      <p className={p.sectionKicker}>{total} مراجعة</p>
      <h2 id="product-reviews-title" className={p.sectionTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
        تقييمات العملاء
      </h2>
      <p className={p.sectionSub}>آراء عملاء حقيقيين اشتروا هذا المنتج</p>

      {loading && page === 1 ? (
        <Skeleton height={260} radius="28px" />
      ) : reviews.length === 0 ? (
        <EmptyState title="لا توجد مراجعات معتمدة بعد" description="كن أول من يقيّم هذا المنتج بعد استلام طلبك." />
      ) : (
        <div className={s.layout}>
          <ReviewsSummary avg={avg} total={total} distribution={meta?.distribution} />
          <ul className={s.list}>
            {reviews.map((r) => (
              <ProductReviewCard key={r.id} review={r} onOpenImage={setLightbox} />
            ))}
            {hasMore && (
              <li style={{ display: "flex", justifyContent: "center", listStyle: "none" }}>
                <button type="button" className={s.more} onClick={loadMore} disabled={loading}>
                  {loading ? "جاري التحميل..." : "عرض المزيد"}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {lightbox && (
        <div className={g.lightbox} role="dialog" aria-modal="true" aria-label="صورة من التقييم" onClick={() => setLightbox(null)}>
          <button type="button" className={g.close} onClick={() => setLightbox(null)} aria-label="إغلاق">
            <X size={22} strokeWidth={1.9} />
          </button>
          <div className={g.lightboxImg} role="img" aria-label="صورة من التقييم" style={{ backgroundImage: `url(${lightbox})` }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
