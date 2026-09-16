// components/product/ProductReviewsSection.tsx
// مراجعات المنتج الحقيقية عبر GET /api/products/[id]/reviews — بنفس نمط
// StoreReviewsSection، مع دعم صور المراجعة (Review.images الحقيقي).

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Leaf, MessageCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { timeAgoAr } from "@/lib/store-helpers";
import { ProductDetail, ProductReviewsResponse } from "./types";

function StarRow({
  rating,
  size = 13,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
      aria-label={`التقييم ${rating} من 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.6}
          color={t.colors.gold[600]}
          fill={i < rating ? t.colors.gold[600] : "none"}
        />
      ))}
    </div>
  );
}

export default function ProductReviewsSection({
  product,
}: {
  product: ProductDetail;
}) {
  const [reviews, setReviews] =
    useState<ProductReviewsResponse["reviews"]>([]);
  const [meta, setMeta] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    api
      .get<ProductReviewsResponse>(
        `/api/products/${product.id}/reviews?page=${page}&limit=6`
      )
      .then((res) => {
        setMeta(res);
        setReviews((prev) =>
          page === 1 ? res.reviews : [...prev, ...res.reviews]
        );
      })
      .catch(() => setMeta(null))
      .finally(() => setLoading(false));
  }, [product.id, page]);

  const avg = meta?.avgRating ?? product.avgRating;
  const total = meta?.totalReviews ?? product.totalReviews;
  const distribution = meta?.distribution;

  const maxCount = distribution
    ? Math.max(1, ...Object.values(distribution))
    : 1;

  return (
    <section
      dir="rtl"
      className="basita-product-reviews"
      style={{
        marginTop: t.spacing["8"],
      }}
      aria-labelledby="product-reviews-title"
    >
      {/* عنوان القسم */}
      <div
        className="basita-reviews-heading"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.spacing["3"],
          marginBottom: t.spacing["4"],
        }}
      >
        <div>
          <h2
            id="product-reviews-title"
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1.4,
            }}
          >
            التقييمات والمراجعات
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.light,
            }}
          >
            تجارب العملاء بعد شراء المنتج
          </p>
        </div>

        {total > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: t.radius.full,
              background: t.colors.cream.warm,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              flexShrink: 0,
            }}
          >
            <MessageCircle size={13} strokeWidth={1.8} />
            {total} مراجعة
          </div>
        )}
      </div>

      <div
        className="basita-reviews-card"
        style={{
          position: "relative",
          overflow: "hidden",
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.xl,
          padding: t.spacing["5"],
          boxShadow: "0 8px 26px rgba(25, 45, 35, 0.045)",
        }}
      >
        {/* لمسة هوية بسيطة */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            insetInlineStart: 0,
            width: 72,
            height: 3,
            background: t.colors.gold[600],
            borderRadius: "0 0 5px 0",
          }}
        />

        {/* ملخص التقييم */}
        <div
          className="basita-reviews-summary"
          style={{
            display: "grid",
            gridTemplateColumns: distribution
              ? "150px minmax(220px, 1fr)"
              : "1fr",
            gap: t.spacing["6"],
            alignItems: "center",
            paddingBottom: t.spacing["5"],
            borderBottom: `1px solid ${t.colors.cream.border}`,
          }}
        >
          {/* المتوسط */}
          <div
            style={{
              textAlign: "center",
              padding: t.spacing["2"],
            }}
          >
            <div
              style={{
                fontSize: "clamp(32px, 4vw, 42px)",
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.gold[600],
                lineHeight: 1,
                letterSpacing: "-0.5px",
              }}
            >
              {avg.toFixed(1)}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 9,
              }}
            >
              <StarRow rating={Math.round(avg)} size={16} />
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.mid,
              }}
            >
              بناءً على {total} مراجعة
            </div>
          </div>

          {/* توزيع التقييمات */}
          {distribution && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 0,
              }}
            >
              {(["5", "4", "3", "2", "1"] as const).map((star) => {
                const count = distribution[star];
                const pct = total > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div
                    key={star}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "34px minmax(80px, 1fr) 28px",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.text.mid,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {star}
                      <Star
                        size={11}
                        strokeWidth={1.8}
                        color={t.colors.gold[600]}
                        fill={t.colors.gold[600]}
                      />
                    </span>

                    <div
                      style={{
                        height: 7,
                        borderRadius: t.radius.full,
                        background: t.colors.cream.border,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          minWidth: count > 0 ? 3 : 0,
                          borderRadius: t.radius.full,
                          background: t.colors.gold[600],
                          transition: "width 300ms ease",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.text.mid,
                        textAlign: "end",
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

        {/* قائمة المراجعات */}
        <div
          style={{
            paddingTop: t.spacing["5"],
          }}
        >
          {loading && (
            <div
              className="basita-reviews-loading"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: `${t.spacing["6"]} 0`,
                color: t.colors.text.mid,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: `2px solid ${t.colors.cream.border}`,
                  borderTopColor: t.colors.primary[700],
                  animation: "basitaReviewsSpin 700ms linear infinite",
                }}
              />

              <span
                style={{
                  fontSize: t.typography.fontSize.xs,
                }}
              >
                جاري تحميل المراجعات...
              </span>
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 9,
                padding: `${t.spacing["6"]} ${t.spacing["4"]}`,
                color: t.colors.text.mid,
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: t.colors.primary[100],
                  color: t.colors.primary[700],
                }}
              >
                <Leaf size={19} strokeWidth={1.7} />
              </span>

              <p
                style={{
                  margin: 0,
                  maxWidth: 420,
                  fontSize: t.typography.fontSize.sm,
                  lineHeight: 1.8,
                }}
              >
                لا توجد مراجعات معتمدة بعد — كوني أول من يقيّم هذا المنتج بعد
                استلامه
              </p>
            </div>
          )}

          {!loading && reviews.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {reviews.map((r, index) => (
                <article
                  key={r.id}
                  className="basita-review-item"
                  style={{
                    display: "flex",
                    gap: t.spacing["3"],
                    padding: `${index === 0 ? 0 : t.spacing["4"]} 0 ${
                      index === reviews.length - 1
                        ? 0
                        : t.spacing["4"]
                    }`,
                    borderBottom:
                      index === reviews.length - 1
                        ? "none"
                        : `1px solid ${t.colors.cream.borderLight}`,
                  }}
                >
                  {/* الصورة الشخصية */}
                  {r.user.avatar ? (
                    <Image
                      src={r.user.avatar}
                      alt={r.user.name}
                      width={42}
                      height={42}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                        border: `1px solid ${t.colors.cream.border}`,
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: t.colors.primary[100],
                        color: t.colors.primary[800],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.bold,
                        flexShrink: 0,
                        border: `1px solid ${t.colors.cream.border}`,
                      }}
                    >
                      {r.user.name.trim().charAt(0)}
                    </div>
                  )}

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* اسم المستخدم والتاريخ */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: t.spacing["2"],
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.text.dark,
                        }}
                      >
                        {r.user.name}
                      </span>

                      <span
                        style={{
                          fontSize: t.typography.fontSize.xs,
                          color: t.colors.text.light,
                        }}
                      >
                        {timeAgoAr(r.createdAt)}
                      </span>
                    </div>

                    {/* النجوم */}
                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      <StarRow rating={r.rating} />
                    </div>

                    {/* النص */}
                    {r.comment && (
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: t.typography.fontSize.sm,
                          color: t.colors.text.body,
                          lineHeight: 1.9,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {r.comment}
                      </p>
                    )}

                    {/* صور المراجعة */}
                    {r.images.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 7,
                          marginTop: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        {r.images.map((src) => (
                          <button
                            key={src}
                            type="button"
                            onClick={() => setLightbox(src)}
                            className="basita-review-image"
                            style={{
                              width: 68,
                              height: 68,
                              flexShrink: 0,
                              padding: 0,
                              border: `1px solid ${t.colors.cream.border}`,
                              borderRadius: t.radius.md,
                              background: `url(${src}) center/cover`,
                              cursor: "zoom-in",
                              overflow: "hidden",
                            }}
                            aria-label="عرض صورة المراجعة"
                          />
                        ))}
                      </div>
                    )}

                    {/* رد المتجر */}
                    {r.sellerReply && (
                      <div
                        style={{
                          marginTop: 11,
                          padding: "10px 12px",
                          background: t.colors.cream.warm,
                          border: `1px solid ${t.colors.cream.border}`,
                          borderRadius: t.radius.md,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 3,
                            color: t.colors.primary[800],
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.bold,
                          }}
                        >
                          <MessageCircle size={12} strokeWidth={1.8} />
                          رد المتجر
                        </div>

                        <span
                          style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.text.body,
                            lineHeight: 1.8,
                          }}
                        >
                          {r.sellerReply}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* عرض المزيد */}
          {meta && meta.total > meta.page * meta.limit && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: t.spacing["5"],
              }}
            >
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="basita-load-more"
                style={{
                  minWidth: 130,
                  padding: "10px 20px",
                  background: t.colors.white,
                  border: `1.5px solid ${t.colors.primary[800]}`,
                  color: t.colors.primary[800],
                  borderRadius: t.radius.full,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.bold,
                  cursor: "pointer",
                }}
              >
                عرض المزيد
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="عرض صورة المراجعة"
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: t.spacing["5"],
            background: "rgba(15, 61, 46, 0.92)",
            backdropFilter: "blur(7px)",
            cursor: "zoom-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(92vw, 1100px)",
              maxHeight: "88vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={lightbox}
              alt="صورة مراجعة"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "88vh",
                borderRadius: t.radius.lg,
                objectFit: "contain",
                boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="إغلاق الصورة"
            style={{
              position: "absolute",
              top: 20,
              insetInlineEnd: 20,
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.94)",
              color: t.colors.text.dark,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .basita-reviews-card {
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .basita-review-image {
          transition:
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .basita-review-image:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(25, 45, 35, 0.12);
        }

        .basita-load-more {
          transition:
            background-color 160ms ease,
            color 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .basita-load-more:hover {
          background: ${t.colors.primary[800]} !important;
          color: ${t.colors.white} !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(15, 61, 46, 0.12);
        }

        .basita-load-more:focus-visible,
        .basita-review-image:focus-visible {
          outline: 3px solid rgba(198, 164, 82, 0.28);
          outline-offset: 2px;
        }

        @keyframes basitaReviewsSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .basita-reviews-card {
            padding: ${t.spacing["4"]} !important;
            border-radius: ${t.radius.lg} !important;
          }

          .basita-reviews-summary {
            grid-template-columns: 1fr !important;
            gap: ${t.spacing["4"]} !important;
          }

          .basita-reviews-summary > div:first-child {
            padding-bottom: ${t.spacing["2"]} !important;
          }

          .basita-review-item {
            gap: ${t.spacing["2"]} !important;
          }
        }

        @media (max-width: 460px) {
          .basita-reviews-heading {
            align-items: flex-start !important;
            flex-direction: column !important;
          }

          .basita-review-image {
            width: 60px !important;
            height: 60px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-review-image,
          .basita-load-more {
            transition: none !important;
          }

          .basita-reviews-loading span {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}