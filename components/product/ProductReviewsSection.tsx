// components/product/ProductReviewsSection.tsx
// مراجعات المنتج الحقيقية عبر GET /api/products/[id]/reviews — بنفس نمط
// StoreReviewsSection، مع دعم صور المراجعة (Review.images الحقيقي).
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Leaf } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { timeAgoAr } from "@/lib/store-helpers";
import { ProductDetail, ProductReviewsResponse } from "./types";

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} strokeWidth={1.5} color={t.colors.gold[600]} fill={i < rating ? t.colors.gold[600] : "none"} />
      ))}
    </div>
  );
}

export default function ProductReviewsSection({ product }: { product: ProductDetail }) {
  const [reviews, setReviews] = useState<ProductReviewsResponse["reviews"]>([]);
  const [meta, setMeta] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<ProductReviewsResponse>(`/api/products/${product.id}/reviews?page=${page}&limit=6`)
      .then((res) => {
        setMeta(res);
        setReviews((prev) => (page === 1 ? res.reviews : [...prev, ...res.reviews]));
      })
      .catch(() => setMeta(null))
      .finally(() => setLoading(false));
  }, [product.id, page]);

  const avg = meta?.avgRating ?? product.avgRating;
  const total = meta?.totalReviews ?? product.totalReviews;
  const distribution = meta?.distribution;
  const maxCount = distribution ? Math.max(1, ...Object.values(distribution)) : 1;

  return (
    <section style={{ marginTop: t.spacing["8"] }}>
      <h2 style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: `0 0 ${t.spacing["4"]}` }}>
        التقييمات والمراجعات
      </h2>

      <div style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["5"] }}>
        <div style={{ display: "flex", gap: t.spacing["6"], flexWrap: "wrap", alignItems: "center", paddingBottom: t.spacing["4"], borderBottom: `1px solid ${t.colors.cream.border}` }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[600] }}>{avg.toFixed(1)}</div>
            <div style={{ display: "flex", justifyContent: "center" }}><StarRow rating={Math.round(avg)} size={15} /></div>
            <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, marginTop: 4 }}>{total} مراجعة</div>
          </div>

          {distribution && (
            <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
              {(["5", "4", "3", "2", "1"] as const).map((star) => {
                const count = distribution[star];
                const pct = total > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, width: 34, flexShrink: 0 }}>
                      {star} <Star size={11} strokeWidth={1.8} color={t.colors.gold[600]} fill={t.colors.gold[600]} />
                    </span>
                    <div style={{ flex: 1, height: 6, borderRadius: t.radius.full, background: t.colors.cream.border, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: t.colors.gold[600] }} />
                    </div>
                    <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, width: 24, flexShrink: 0, textAlign: "end" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ paddingTop: t.spacing["4"] }}>
          {loading && <p style={{ color: t.colors.text.mid, textAlign: "center", margin: 0 }}>جاري تحميل المراجعات...</p>}

          {!loading && reviews.length === 0 && (
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: t.colors.text.mid, textAlign: "center", margin: 0, padding: `${t.spacing["4"]} 0` }}>
              لا توجد مراجعات معتمدة بعد — كوني أول من يقيّم هذا المنتج بعد استلامه
              <Leaf size={14} strokeWidth={1.8} color={t.colors.primary[600]} />
            </p>
          )}

          {!loading && reviews.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: t.spacing["3"], paddingBottom: t.spacing["3"], borderBottom: `1px solid ${t.colors.cream.borderLight}` }}>
                  {r.user.avatar ? (
                    <Image src={r.user.avatar} alt={r.user.name} width={38} height={38} style={{ borderRadius: "50%", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.colors.primary[100], color: t.colors.primary[800], display: "flex", alignItems: "center", justifyContent: "center", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, flexShrink: 0 }}>
                      {r.user.name.trim().charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: t.spacing["2"], flexWrap: "wrap" }}>
                      <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.dark }}>{r.user.name}</span>
                      <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light }}>{timeAgoAr(r.createdAt)}</span>
                    </div>
                    <div style={{ margin: "2px 0" }}>
                      <StarRow rating={r.rating} />
                    </div>
                    {r.comment && <p style={{ margin: "4px 0 0", fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.snug }}>{r.comment}</p>}

                    {r.images.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        {r.images.map((src) => (
                          <button
                            key={src}
                            onClick={() => setLightbox(src)}
                            style={{ width: 56, height: 56, borderRadius: t.radius.sm, background: `url(${src}) center/cover`, border: `1px solid ${t.colors.cream.border}`, cursor: "zoom-in", padding: 0 }}
                            aria-label="صورة مراجعة"
                          />
                        ))}
                      </div>
                    )}

                    {r.sellerReply && (
                      <div style={{ marginTop: 6, background: t.colors.cream.warm, borderRadius: t.radius.sm, padding: "8px 10px" }}>
                        <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>رد المتجر: </span>
                        <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.body }}>{r.sellerReply}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {meta && meta.total > meta.page * meta.limit && (
            <div style={{ textAlign: "center", marginTop: t.spacing["4"] }}>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="basita-btn-interactive"
                style={{ padding: "9px 20px", background: t.colors.white, border: `1.5px solid ${t.colors.primary[800]}`, color: t.colors.primary[800], borderRadius: t.radius.full, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}
              >
                عرض المزيد
              </button>
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,61,46,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: t.spacing["5"], cursor: "zoom-out" }}
        >
          <img src={lightbox} alt="صورة مراجعة" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: t.radius.md, objectFit: "contain" }} />
        </div>
      )}
    </section>
  );
}
