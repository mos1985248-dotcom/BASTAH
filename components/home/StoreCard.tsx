// components/home/StoreCard.tsx
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { t } from "@/theme";

export interface HomeStore {
  id: string;
  nameAr: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  shortDesc: string | null;
  city: string;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
}

export default function StoreCard({ store }: { store: HomeStore }) {
  return (
    <a
      href={`/store/${store.slug}`}
      style={{
        textDecoration: "none",
        display: "block",
        height: "100%",
      }}
    >
      <article
        className="basita-store-card"
        style={{
          position: "relative",
          height: "100%",
          minHeight: 245,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: t.colors.cream.card,
          border: `1px solid ${t.colors.cream.borderLight}`,
          borderRadius: t.radius.lg,
          boxShadow: t.shadows.xs,
          transition:
            `transform ${t.motion.base} ${t.motion.ease}, ` +
            `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
            `border-color ${t.motion.base} ${t.motion.ease}`,
        }}
      >
        {/* غلاف المتجر */}
        <div
          className="basita-store-cover"
          style={{
            position: "relative",
            width: "100%",
            height: 124,
            overflow: "hidden",
            background: store.coverImage
              ? `url(${store.coverImage}) center/cover no-repeat`
              : `linear-gradient(135deg, ${t.colors.primary[700]}, ${t.colors.primary[900]})`,
          }}
        >
          {/* طبقة خفيفة لتحسين وضوح الغلاف */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(15,61,46,0.02), rgba(15,61,46,0.18))",
            }}
          />

          {/* شارة المتجر الموثق */}
          {store.isVerified && (
            <div
              className="basita-store-verified-badge"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 9px",
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.94)",
                border: `1px solid ${t.colors.cream.borderLight}`,
                color: t.colors.primary[800],
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                backdropFilter: "blur(5px)",
              }}
            >
              <BadgeCheck size={14} strokeWidth={2.2} />
              موثّق
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div
          className="basita-store-content"
          style={{
            position: "relative",
            flex: 1,
            padding: "34px 16px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* شعار المتجر */}
          <div
            className="basita-store-logo"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -30,
              right: 16,
              width: 60,
              height: 60,
              borderRadius: t.radius.md,
              background: store.logo
                ? `url(${store.logo}) center/cover no-repeat`
                : t.colors.gold[100],
              border: `3px solid ${t.colors.cream.card}`,
              boxShadow: t.shadows.sm,
              overflow: "hidden",
            }}
          />

          {/* اسم المتجر */}
          <div
            className="basita-store-name-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: 0,
              marginBottom: 7,
            }}
          >
            <p
              style={{
                margin: 0,
                minWidth: 0,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: t.colors.text.dark,
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              {store.nameAr}
            </p>

            {store.isVerified && (
              <BadgeCheck
                size={17}
                strokeWidth={2.2}
                color={t.colors.primary[600]}
                style={{ flexShrink: 0 }}
              />
            )}
          </div>

          {/* المدينة والتقييم */}
          <div
            className="basita-store-meta"
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 7,
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.xs,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <MapPin size={13} strokeWidth={1.8} />
              {store.city}
            </span>

            {store.totalReviews > 0 && (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: t.radius.full,
                    background: t.colors.cream.border,
                  }}
                />

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    color: t.colors.text.dark,
                    fontWeight: t.typography.fontWeight.semibold,
                  }}
                >
                  <Star
                    size={13}
                    strokeWidth={2}
                    color={t.colors.gold[600]}
                    fill={t.colors.gold[600]}
                  />
                  {store.avgRating.toFixed(1)}
                </span>

                <span style={{ color: t.colors.text.light }}>
                  ({store.totalReviews})
                </span>
              </>
            )}
          </div>

          {/* وصف مختصر */}
          {store.shortDesc && (
            <p
              className="basita-store-description"
              style={{
                margin: 0,
                color: t.colors.text.mid,
                fontSize: t.typography.fontSize.xs,
                lineHeight: 1.7,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {store.shortDesc}
            </p>
          )}

          {/* شريط سفلي */}
          <div
            className="basita-store-footer"
            style={{
              marginTop: "auto",
              paddingTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              borderTop: `1px solid ${t.colors.cream.borderLight}`,
            }}
          >
            <span
              style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.gold[700],
              }}
            >
              زيارة المتجر
            </span>

            <span
              aria-hidden="true"
              className="basita-store-arrow"
              style={{
                width: 28,
                height: 28,
                borderRadius: t.radius.full,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: t.colors.gold[100],
                color: t.colors.gold[700],
                fontSize: 15,
                transition: `transform ${t.motion.fast} ${t.motion.ease}`,
              }}
            >
              ←
            </span>
          </div>
        </div>
      </article>

      {/* Mobile card refinement */}
      <style jsx>{`
        @media (max-width: 767px) {
          .basita-store-card {
            min-height: 0 !important;
            height: auto !important;
            border-radius: 14px !important;
            box-shadow: 0 2px 8px rgba(67, 48, 29, 0.05) !important;
          }

          .basita-store-cover {
            height: 92px !important;
          }

          .basita-store-verified-badge {
            top: 7px !important;
            right: 7px !important;
            padding: 4px 7px !important;
            gap: 4px !important;
            font-size: 10px !important;
          }

          .basita-store-verified-badge svg {
            width: 12px !important;
            height: 12px !important;
          }

          .basita-store-content {
            padding: 28px 12px 11px !important;
          }

          .basita-store-logo {
            top: -24px !important;
            right: 12px !important;
            width: 48px !important;
            height: 48px !important;
            border-width: 2px !important;
            border-radius: 11px !important;
          }

          .basita-store-name-row {
            gap: 5px !important;
            margin-bottom: 4px !important;
          }

          .basita-store-name-row p {
            font-size: 14px !important;
            line-height: 1.4 !important;
          }

          .basita-store-name-row svg {
            width: 15px !important;
            height: 15px !important;
          }

          .basita-store-meta {
            gap: 6px !important;
            margin-bottom: 7px !important;
            font-size: 11px !important;
          }

          .basita-store-meta svg {
            width: 12px !important;
            height: 12px !important;
          }

          .basita-store-description {
            font-size: 11px !important;
            line-height: 1.65 !important;
            -webkit-line-clamp: 2 !important;
          }

          .basita-store-footer {
            margin-top: 9px !important;
            padding-top: 8px !important;
          }

          .basita-store-footer > span:first-child {
            font-size: 11px !important;
          }

          .basita-store-arrow {
            width: 24px !important;
            height: 24px !important;
            font-size: 13px !important;
          }
        }

        @media (max-width: 420px) {
          .basita-store-cover {
            height: 86px !important;
          }

          .basita-store-content {
            padding: 27px 11px 10px !important;
          }

          .basita-store-logo {
            right: 11px !important;
            width: 46px !important;
            height: 46px !important;
          }

          .basita-store-name-row p {
            font-size: 13px !important;
          }

          .basita-store-description {
            font-size: 10.5px !important;
          }
        }
      `}</style>
    </a>
  );
}