// components/store/StoreReviewsSection.tsx
// يستبدل StoreRatingSummary — يعرض المعدّل الحقيقي + توزيع النجوم الفعلي
// (من GROUP BY على Review) + قائمة مراجعات معتمدة حقيقية عبر
// GET /api/stores/[slug]/reviews. لا بيانات ملفّقة: لو لا توجد مراجعات
// بعد، تُعرض حالة فارغة صادقة بدل تلفيق محتوى.
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Leaf } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { timeAgoAr } from "@/lib/store-helpers";
import { StoreDetail, StoreReviewsResponse } from "./types";
import Skeleton from "@/components/ui/Skeleton";

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} strokeWidth={1.5} color={t.colors.gold[600]} fill={i < rating ? t.colors.gold[600] : "none"} />
      ))}
    </div>
  );
}

export default function StoreReviewsSection({ store }: { store: StoreDetail }) {
  const [data, setData] = useState<StoreReviewsResponse | null>(null);
  const [reviews, setReviews] = useState<StoreReviewsResponse["reviews"]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get<StoreReviewsResponse>(`/api/stores/${store.slug}/reviews?page=${page}&limit=6`)
      .then((res) => {
        setData(res);
        setReviews((prev) => (page === 1 ? res.reviews : [...prev, ...res.reviews]));
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [store.slug, page]);

  const avg = data?.avgRating ?? store.avgRating;
  const total = data?.totalReviews ?? store.totalReviews;
  const distribution = data?.distribution;
  const maxCount = distribution ? Math.max(1, ...Object.values(distribution)) : 1;

  return (
    <section style={{ maxWidth: 1080, margin: `${t.spacing["6"]} auto 0`, padding: `0 ${t.spacing["4"]}`, direction: "rtl" }}>
      <h2 style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: `0 0 ${t.spacing["4"]}` }}>
        تقييمات العملاء
      </h2>

      <div style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["6"] }}>
        {/* الملخص العلوي */}
        <div style={{ display: "flex", gap: t.spacing["6"], flexWrap: "wrap", alignItems: "center", paddingBottom: t.spacing["5"], borderBottom: `1px solid ${t.colors.cream.border}` }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[600] }}>{avg.toFixed(1)}</div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <StarRow rating={Math.round(avg)} size={16} />
            </div>
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

        {/* قائمة المراجعات */}
        <div style={{ paddingTop: t.spacing["5"] }}>
          {loading && page === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ display: "flex", gap: t.spacing["3"] }}>
                  <Skeleton width={38} height={38} radius="50%" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skeleton width="40%" height={16} />
                    <Skeleton width="80%" height={14} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <div style={{ textAlign: "center", padding: `${t.spacing["8"]} 0` }}>
              <p style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, color: t.colors.text.mid, margin: 0, fontSize: t.typography.fontSize.sm }}>
                لا توجد مراجعات معتمدة بعد — كوني أول من يقيّم هذا المتجر بعد استلام طلبك
                <Leaf size={14} strokeWidth={1.8} color={t.colors.primary[600]} />
              </p>
            </div>
          )}

          {reviews.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: t.spacing["3"], paddingBottom: t.spacing["4"], borderBottom: `1px solid ${t.colors.cream.borderLight}` }}>
                  {r.user.avatar ? (
                    <Image src={r.user.avatar} alt={r.user.name} width={38} height={38} style={{ borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
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
                    <div style={{ display: "flex", alignItems: "center", margin: "4px 0" }}>
                      <StarRow rating={r.rating} />
                      {r.product?.nameAr && <span style={{ color: t.colors.text.light, fontSize: t.typography.fontSize.xs, marginInlineStart: 6 }}>· {r.product.nameAr}</span>}
                    </div>
                    {r.comment && <p style={{ margin: `4px 0 0`, fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.snug }}>{r.comment}</p>}
                    {r.sellerReply && (
                      <div style={{ marginTop: 8, background: t.colors.cream?.warm || "#fdfbf7", borderRadius: t.radius.sm, padding: "8px 12px", borderInlineStart: `3px solid ${t.colors.primary[800]}` }}>
                        <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>رد المتجر: </span>
                        <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.body }}>{r.sellerReply}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data && data.total > data.page * data.limit && (
            <div style={{ textAlign: "center", marginTop: t.spacing["5"] }}>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="basita-btn-interactive"
                style={{ padding: "9px 22px", background: t.colors.white, border: `1.5px solid ${t.colors.primary[800]}`, color: t.colors.primary[800], borderRadius: t.radius.full, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, cursor: loading ? "wait" : "pointer" }}
              >
                {loading ? "جاري التحميل..." : "عرض المزيد"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}