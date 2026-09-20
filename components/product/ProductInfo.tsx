// components/product/ProductInfo.tsx
"use client";

import { useState } from "react";
import {
  Store,
  BadgeCheck,
  Share2,
  Heart,
  Star,
  Hand,
  Leaf,
} from "lucide-react";
import { t } from "@/theme";
import { shareContent } from "@/lib/share";
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
    const result = await shareContent({
      title: product.nameAr,
      text: product.descAr ?? product.nameAr,
    });

    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      dir="rtl"
      className="basita-product-info"
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* المتجر + المشاركة والمفضلة */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.spacing["3"],
          marginBottom: t.spacing["2"],
        }}
      >
        <a
          href={`/store/${product.store.slug}`}
          className="basita-product-store-link"
          style={{
            minWidth: 0,
            maxWidth: "calc(100% - 90px)",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 9px",
            borderRadius: t.radius.full,
            background: t.colors.primary[100],
            color: t.colors.primary[800],
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
            textDecoration: "none",
            transition: "background 160ms ease, transform 160ms ease",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: t.colors.white,
            }}
          >
            <Store size={12} strokeWidth={1.9} />
          </span>

          <span
            className="basita-product-store-name"
            style={{
              minWidth: 0,
              maxWidth: 210,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.store.nameAr}
          </span>

          {product.store.isVerified && (
            <BadgeCheck
              size={14}
              strokeWidth={1.9}
              color={t.colors.primary[800]}
              aria-label="متجر موثّق"
            />
          )}
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleShare}
            aria-label="مشاركة"
            className="basita-product-action-button"
            style={{
              width: 36,
              height: 36,
              border: `1px solid ${t.colors.cream.border}`,
              background: t.colors.white,
              borderRadius: t.radius.full,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: copied
                ? t.colors.primary[800]
                : t.colors.text.mid,
              boxShadow: "0 2px 7px rgba(25,45,35,0.04)",
              transition:
                "transform 160ms ease, border-color 160ms ease, background 160ms ease",
            }}
            title={copied ? "تم نسخ الرابط" : "مشاركة"}
          >
            <Share2 size={16} strokeWidth={1.8} />
          </button>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={
                isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"
              }
              className="basita-product-action-button"
              style={{
                width: 36,
                height: 36,
                border: `1px solid ${
                  isFavorite
                    ? "rgba(190, 55, 55, 0.18)"
                    : t.colors.cream.border
                }`,
                background: isFavorite
                  ? "rgba(190, 55, 55, 0.06)"
                  : t.colors.white,
                borderRadius: t.radius.full,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isFavorite
                  ? t.colors.semantic.danger
                  : t.colors.text.light,
                boxShadow: "0 2px 7px rgba(25,45,35,0.04)",
                transition:
                  "transform 160ms ease, border-color 160ms ease, background 160ms ease",
              }}
            >
              <Heart
                size={17}
                strokeWidth={1.8}
                fill={
                  isFavorite
                    ? t.colors.semantic.danger
                    : "none"
                }
              />
            </button>
          )}
        </div>
      </div>

      {/* اسم المنتج */}
      <h1
        style={{
          margin: `0 0 ${t.spacing["2"]}`,
          fontSize: "clamp(23px, 2.7vw, 29px)",
          lineHeight: 1.38,
          fontWeight: t.typography.fontWeight.bold,
          letterSpacing: "-0.02em",
          color: t.colors.text.dark,
        }}
      >
        {product.nameAr}
      </h1>

      {/* التقييم + المبيعات + صناعة يدوية */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: t.spacing["3"],
          flexWrap: "wrap",
        }}
      >
        {product.totalReviews > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              minHeight: 28,
              padding: "3px 9px",
              borderRadius: t.radius.full,
              background: t.colors.gold[100],
              color: t.colors.gold[600],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            <Star
              size={13}
              strokeWidth={2}
              fill={t.colors.gold[600]}
            />

            {product.avgRating.toFixed(1)}

            <span
              style={{
                fontWeight: t.typography.fontWeight.regular,
                opacity: 0.85,
              }}
            >
              ({product.totalReviews} مراجعة)
            </span>
          </span>
        )}

        {product.totalSold > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 28,
              padding: "3px 9px",
              borderRadius: t.radius.full,
              background: t.colors.cream.warm,
              color: t.colors.text.mid,
              fontSize: 12,
            }}
          >
            تم بيع {product.totalSold} قطعة
          </span>
        )}

        {product.isHandmade && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              minHeight: 28,
              padding: "3px 10px",
              borderRadius: t.radius.full,
              background: t.colors.primary[100],
              color: t.colors.primary[800],
              fontSize: 12,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            <Hand size={12} strokeWidth={1.8} />
            صناعة يدوية
          </span>
        )}
      </div>

      {/* الوصف */}
      {product.descAr && (
        <div
          style={{
            position: "relative",
            marginBottom: t.spacing["3"],
            paddingInlineStart: t.spacing["3"],
            borderInlineStart: `2px solid ${t.colors.gold[600]}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.body,
              lineHeight: 1.85,
            }}
          >
            {product.descAr}
          </p>
        </div>
      )}

      {/* الوسوم */}
      {product.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            marginTop: t.spacing["1"],
          }}
        >
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="basita-product-tag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: t.colors.text.body,
                background: t.colors.cream.warm,
                border: `1px solid ${t.colors.cream.border}`,
                padding: "4px 9px",
                borderRadius: t.radius.full,
                transition:
                  "border-color 160ms ease, background 160ms ease",
              }}
            >
              <Leaf
                size={11}
                strokeWidth={1.8}
                color={t.colors.primary[700]}
              />

              {tag}
            </span>
          ))}
        </div>
      )}

      <style>{`
        .basita-product-store-link:hover {
          background: ${t.colors.primary[100]};
          transform: translateY(-1px);
        }

        .basita-product-action-button:hover {
          transform: translateY(-2px);
          border-color: ${t.colors.primary[600]} !important;
          background: ${t.colors.primary[100]} !important;
        }

        .basita-product-action-button:focus-visible,
        .basita-product-store-link:focus-visible {
          outline: 2px solid ${t.colors.gold[600]};
          outline-offset: 2px;
        }

        .basita-product-tag:hover {
          background: ${t.colors.primary[100]};
          border-color: ${t.colors.primary[100]};
        }

        @media (max-width: 700px) {
          .basita-product-store-link {
            max-width: calc(100% - 84px) !important;
          }

          .basita-product-store-name {
            max-width: 150px !important;
          }
        }

        @media (max-width: 420px) {
          .basita-product-action-button {
            width: 35px !important;
            height: 35px !important;
          }

          .basita-product-store-link {
            padding: 5px 8px !important;
            font-size: 11px !important;
          }

          .basita-product-store-link > span:first-child {
            width: 22px !important;
            height: 22px !important;
          }

          .basita-product-store-name {
            max-width: 115px !important;
          }

          .basita-product-store-link svg {
            width: 12px !important;
            height: 12px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-product-store-link,
          .basita-product-action-button,
          .basita-product-tag {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}