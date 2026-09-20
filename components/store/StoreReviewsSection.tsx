// components/store/StoreReviewsSection.tsx
// يعرض المعدّل الحقيقي + توزيع النجوم الفعلي
// + قائمة مراجعات معتمدة حقيقية.
// لا توجد بيانات ملفّقة: عند عدم وجود مراجعات تظهر حالة فارغة صادقة.

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Leaf } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { timeAgoAr } from "@/lib/store-helpers";
import { StoreDetail, StoreReviewsResponse } from "./types";
import Skeleton from "@/components/ui/Skeleton";

function StarRow({
  rating,
  size = 13,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div
      aria-label={`التقييم ${rating} من 5`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1.6}
          color={t.colors.gold[600]}
          fill={index < rating ? t.colors.gold[600] : "none"}
        />
      ))}
    </div>
  );
}

export default function StoreReviewsSection({
  store,
}: {
  store: StoreDetail;
}) {
  const [data, setData] = useState<StoreReviewsResponse | null>(null);
  const [reviews, setReviews] =
    useState<StoreReviewsResponse["reviews"]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    setLoading(true);

    api
      .get<StoreReviewsResponse>(
        `/api/stores/${store.slug}/reviews?page=${page}&limit=6`
      )
      .then((res) => {
        if (!active) return;

        setData(res);

        setReviews((prev) =>
          page === 1 ? res.reviews : [...prev, ...res.reviews]
        );
      })
      .catch(() => {
        if (!active) return;

        if (page === 1) {
          setData(null);
          setReviews([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [store.slug, page]);

  const avg = data?.avgRating ?? store.avgRating;
  const total = data?.totalReviews ?? store.totalReviews;
  const distribution = data?.distribution;

  const maxCount = distribution
    ? Math.max(1, ...Object.values(distribution))
    : 1;

  const hasReviews = reviews.length > 0;
  const hasDistribution = Boolean(distribution);

  return (
    <section
      id="reviews"
      aria-label="تقييمات العملاء"
      style={{
        width: "100%",
        maxWidth: 1180,
        margin: `${t.spacing["5"]} auto 0`,
        padding: `0 ${t.spacing["4"]}`,
        boxSizing: "border-box",
        direction: "rtl",
      }}
    >
      {/* Section heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: t.spacing["3"],
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.4,
            }}
          >
            تقييمات العملاء
          </h2>

          <p
            style={{
              margin: "2px 0 0",
              color: t.colors.text.light,
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            آراء عملاء حقيقيين بعد تجربة المتجر
          </p>
        </div>

        {total > 0 && (
          <span
            style={{
              flexShrink: 0,
              padding: "4px 9px",
              borderRadius: t.radius.full,
              background: t.colors.cream.warm,
              color: t.colors.text.mid,
              fontSize: "11px",
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            {total} مراجعة
          </span>
        )}
      </div>

      <div
        style={{
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          padding: t.spacing["4"],
          boxShadow: t.shadows.xs,
        }}
      >
        {/* Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: hasDistribution
              ? "170px minmax(240px, 1fr)"
              : "1fr",
            gap: t.spacing["4"],
            alignItems: "center",
            paddingBottom: t.spacing["4"],
            borderBottom: `1px solid ${t.colors.cream.borderLight}`,
          }}
        >
          {/* Overall rating */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                color: t.colors.gold[600],
                fontSize: 32,
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1,
              }}
            >
              {avg.toFixed(1)}
            </div>

            <div style={{ marginTop: 6 }}>
              <StarRow rating={Math.round(avg)} size={15} />
            </div>

            <div
              style={{
                marginTop: 5,
                color: t.colors.text.light,
                fontSize: "10px",
              }}
            >
              من 5 · {total} مراجعة
            </div>
          </div>

          {/* Distribution */}
          {distribution && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                minWidth: 0,
              }}
            >
              {(["5", "4", "3", "2", "1"] as const).map((star) => {
                const count = distribution[star];
                const percent =
                  total > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div
                    key={star}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px minmax(80px, 1fr) 26px",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        color: t.colors.text.mid,
                        fontSize: "11px",
                      }}
                    >
                      {star}
                      <Star
                        size={10}
                        strokeWidth={1.8}
                        color={t.colors.gold[600]}
                        fill={t.colors.gold[600]}
                      />
                    </span>

                    <div
                      style={{
                        height: 6,
                        borderRadius: t.radius.full,
                        background: t.colors.cream.border,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          borderRadius: t.radius.full,
                          background: t.colors.gold[600],
                          transition: "width 0.25s ease",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        color: t.colors.text.light,
                        fontSize: "10px",
                        textAlign: "left",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style={{ paddingTop: t.spacing["4"] }}>
          {loading && page === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: t.spacing["4"],
              }}
            >
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: t.spacing["3"],
                  }}
                >
                  <Skeleton
                    width={38}
                    height={38}
                    radius="50%"
                  />

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Skeleton width="30%" height={14} />
                    <Skeleton width="90%" height={12} />
                    <Skeleton width="60%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !hasReviews && (
            <div
              style={{
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: t.spacing["4"],
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.full,
                  background: t.colors.primary[50],
                  color: t.colors.primary[700],
                  marginBottom: 8,
                }}
              >
                <Leaf size={18} strokeWidth={1.7} />
              </div>

              <p
                style={{
                  maxWidth: 500,
                  margin: 0,
                  color: t.colors.text.mid,
                  fontSize: "12px",
                  lineHeight: 1.7,
                }}
              >
                لا توجد مراجعات معتمدة بعد. يمكنك أن تكون أول من
                يقيّم المتجر بعد استلام طلبك.
              </p>
            </div>
          )}

          {hasReviews && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {reviews.map((review, index) => (
                <article
                  key={review.id}
                  style={{
                    display: "flex",
                    gap: t.spacing["3"],
                    paddingBottom: t.spacing["4"],
                    paddingTop: index === 0 ? 0 : t.spacing["4"],
                    borderBottom:
                      index === reviews.length - 1
                        ? "none"
                        : `1px solid ${t.colors.cream.borderLight}`,
                  }}
                >
                  {/* Avatar */}
                  {review.user.avatar ? (
                    <Image
                      src={review.user.avatar}
                      alt={review.user.name}
                      width={38}
                      height={38}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        flexShrink: 0,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: t.colors.primary[100],
                        color: t.colors.primary[800],
                        fontSize: "12px",
                        fontWeight: t.typography.fontWeight.bold,
                      }}
                    >
                      {review.user.name.trim().charAt(0)}
                    </div>
                  )}

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* Reviewer header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <strong
                        style={{
                          color: t.colors.text.dark,
                          fontSize: "13px",
                          fontWeight:
                            t.typography.fontWeight.semibold,
                        }}
                      >
                        {review.user.name}
                      </strong>

                      <span
                        style={{
                          color: t.colors.text.light,
                          fontSize: "10px",
                        }}
                      >
                        {timeAgoAr(review.createdAt)}
                      </span>
                    </div>

                    {/* Rating / product */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                        marginTop: 4,
                      }}
                    >
                      <StarRow rating={review.rating} />

                      {review.product?.nameAr && (
                        <span
                          style={{
                            color: t.colors.text.light,
                            fontSize: "10px",
                          }}
                        >
                          · {review.product.nameAr}
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          color: t.colors.text.body,
                          fontSize: "12px",
                          lineHeight: 1.8,
                        }}
                      >
                        {review.comment}
                      </p>
                    )}

                    {/* Seller reply */}
                    {review.sellerReply && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "7px 10px",
                          borderRadius: t.radius.md,
                          background: t.colors.cream.warm,
                          borderInlineStart: `3px solid ${t.colors.primary[700]}`,
                        }}
                      >
                        <span
                          style={{
                            color: t.colors.primary[800],
                            fontSize: "10px",
                            fontWeight:
                              t.typography.fontWeight.bold,
                          }}
                        >
                          رد المتجر:
                        </span>{" "}
                        <span
                          style={{
                            color: t.colors.text.body,
                            fontSize: "10px",
                            lineHeight: 1.7,
                          }}
                        >
                          {review.sellerReply}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Load more */}
          {data && data.total > data.page * data.limit && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: t.spacing["4"],
              }}
            >
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={loading}
                className="basita-btn-interactive"
                style={{
                  minHeight: 38,
                  padding: "7px 20px",
                  border: `1px solid ${t.colors.primary[800]}`,
                  borderRadius: t.radius.full,
                  background: t.colors.white,
                  color: t.colors.primary[800],
                  fontSize: "12px",
                  fontWeight: t.typography.fontWeight.bold,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.65 : 1,
                }}
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