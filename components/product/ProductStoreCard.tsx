// components/product/ProductStoreCard.tsx

import { t } from "@/theme";
import {
  BadgeCheck,
  Star,
  Heart,
  ArrowLeft,
  Store,
} from "lucide-react";
import { useStoreFollow } from "@/hooks/useStoreFollow";
import { ProductStore } from "./types";

export default function ProductStoreCard({
  store,
  redirectPath,
}: {
  store: ProductStore;
  redirectPath: string;
}) {
  const { following, followers, busy, toggle } = useStoreFollow(
    store.slug,
    !!store.isFollowing,
    store.totalFollowers,
    redirectPath
  );

  return (
    <div
      dir="rtl"
      className="basita-product-store-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.xl,
        padding: t.spacing["3"],
        display: "flex",
        alignItems: "center",
        gap: t.spacing["3"],
        flexWrap: "wrap",
        boxShadow: "0 5px 18px rgba(25, 45, 35, 0.035)",
        transition:
          "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
      }}
    >
      {/* لمسة هوية خفيفة */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          width: 52,
          height: 3,
          background: t.colors.gold[600],
          borderRadius: "0 0 5px 0",
        }}
      />

      {/* شعار المتجر */}
      <div
        style={{
          width: 54,
          height: 54,
          flexShrink: 0,
          borderRadius: t.radius.md,
          padding: 3,
          background: t.colors.cream.warm,
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: "0 2px 8px rgba(25, 45, 35, 0.05)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: t.radius.sm,
            background: store.logo
              ? `url(${store.logo}) center/cover`
              : t.colors.gold[100],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: t.colors.gold[600],
          }}
          aria-label={
            store.logo ? store.nameAr : "شعار المتجر"
          }
        >
          {!store.logo && (
            <Store
              size={20}
              strokeWidth={1.6}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* معلومات المتجر */}
      <div
        style={{
          flex: 1,
          minWidth: 150,
        }}
      >
        <a
          href={`/store/${store.slug}`}
          className="basita-store-name-link"
          style={{
            width: "fit-content",
            maxWidth: "100%",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: t.colors.text.dark,
            textDecoration: "none",
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.45,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {store.nameAr}
          </span>

          {store.isVerified && (
            <BadgeCheck
              size={14}
              strokeWidth={1.8}
              color={t.colors.primary[800]}
              aria-label="متجر موثّق"
            />
          )}
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 3,
            fontSize: 12,
          }}
        >
          {store.totalReviews > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: t.colors.gold[600],
                fontWeight:
                  t.typography.fontWeight.semibold,
              }}
            >
              <Star
                size={10}
                strokeWidth={1.8}
                color={t.colors.gold[600]}
                fill={t.colors.gold[600]}
              />

              {store.avgRating.toFixed(1)}

              <span
                style={{
                  color: t.colors.text.light,
                  fontWeight:
                    t.typography.fontWeight.regular,
                }}
              >
                ({store.totalReviews})
              </span>
            </span>
          )}

          {store.totalReviews > 0 && (
            <span
              aria-hidden="true"
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: t.colors.cream.border,
              }}
            />
          )}

          <span
            style={{
              color: t.colors.text.mid,
            }}
          >
            {followers} متابع
          </span>
        </div>
      </div>

      {/* الإجراءات */}
      <div
        className="basita-store-actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className="basita-store-follow-button"
          aria-label={
            following
              ? "إلغاء متابعة المتجر"
              : "متابعة المتجر"
          }
          style={{
            minHeight: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "7px 12px",
            background: following
              ? t.colors.primary[100]
              : t.colors.white,
            color: t.colors.primary[800],
            border: `1.5px solid ${t.colors.primary[800]}`,
            borderRadius: t.radius.full,
            fontSize: 12,
            fontWeight:
              t.typography.fontWeight.bold,
            cursor: busy
              ? "not-allowed"
              : "pointer",
            opacity: busy ? 0.65 : 1,
            whiteSpace: "nowrap",
          }}
        >
          <Heart
            size={13}
            strokeWidth={1.8}
            fill={
              following
                ? t.colors.primary[800]
                : "none"
            }
          />

          {following ? "بالمتابعة" : "متابعة"}
        </button>

        <a
          href={`/store/${store.slug}`}
          className="basita-store-view-button"
          style={{
            minHeight: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "7px 13px",
            background: t.colors.primary[800],
            color: t.colors.white,
            border: `1px solid ${t.colors.primary[800]}`,
            borderRadius: t.radius.full,
            textDecoration: "none",
            fontSize: 12,
            fontWeight:
              t.typography.fontWeight.bold,
            whiteSpace: "nowrap",
          }}
        >
          عرض المتجر

          <ArrowLeft
            size={12}
            strokeWidth={2}
          />
        </a>
      </div>

      <style>{`
        .basita-product-store-card:hover {
          transform: translateY(-1px);
          border-color: rgba(15, 61, 46, 0.12);
          box-shadow: 0 9px 23px rgba(25, 45, 35, 0.06);
        }

        .basita-store-name-link {
          transition: color 160ms ease;
        }

        .basita-store-name-link:hover {
          color: ${t.colors.primary[800]} !important;
        }

        .basita-store-follow-button,
        .basita-store-view-button {
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            background-color 160ms ease,
            color 160ms ease;
        }

        .basita-store-follow-button:not(:disabled):hover {
          transform: translateY(-1px);
          background: ${t.colors.primary[100]} !important;
          box-shadow: 0 4px 11px rgba(15, 61, 46, 0.07);
        }

        .basita-store-view-button:hover {
          transform: translateY(-1px);
          background: ${t.colors.primary[700]} !important;
          box-shadow: 0 5px 13px rgba(15, 61, 46, 0.12);
        }

        .basita-store-follow-button:focus-visible,
        .basita-store-view-button:focus-visible,
        .basita-store-name-link:focus-visible {
          outline: 3px solid rgba(198, 164, 82, 0.25);
          outline-offset: 2px;
        }

        @media (max-width: 700px) {
          .basita-product-store-card {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-store-actions {
            width: 100%;
          }

          .basita-store-follow-button,
          .basita-store-view-button {
            flex: 1;
          }
        }

        @media (max-width: 420px) {
          .basita-product-store-card {
            gap: ${t.spacing["2"]} !important;
          }

          .basita-product-store-card > div:first-of-type {
            width: 48px !important;
            height: 48px !important;
          }

          .basita-store-actions {
            gap: 5px !important;
          }

          .basita-store-follow-button,
          .basita-store-view-button {
            min-height: 35px !important;
            padding-inline: 9px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-product-store-card,
          .basita-store-name-link,
          .basita-store-follow-button,
          .basita-store-view-button {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}