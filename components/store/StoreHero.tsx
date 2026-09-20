// components/store/StoreHero.tsx

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  MapPin,
  Play,
  Truck,
  Heart,
  Share2,
  Check,
  ShoppingBag,
  Star,
} from "lucide-react";
import { t } from "@/theme";
import { shareContent } from "@/lib/share";
import { useStoreFollow } from "@/hooks/useStoreFollow";
import { yearsActiveFrom } from "@/lib/store-helpers";
import { StoreDetail } from "./types";

export default function StoreHero({ store }: { store: StoreDetail }) {
  const { following, followers, busy, toggle } = useStoreFollow(
    store.slug,
    !!store.isFollowing,
    store.totalFollowers,
    `/store/${store.slug}`
  );

  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const result = await shareContent({
      title: store.nameAr,
      text: store.shortDesc ?? store.nameAr,
    });

    if (result === "copied") {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const yearsActive = yearsActiveFrom(store.createdAt);
  const mutedBorder = `1px solid ${t.colors.cream.border}`;

  return (
    <section
      style={{
        direction: "rtl",
        width: "100%",
      }}
    >
      {/* Cover */}
      <div
        style={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          background: store.coverImage
            ? `url(${store.coverImage}) center/cover`
            : `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[700]})`,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,61,46,0.02) 0%, rgba(15,61,46,0.10) 45%, rgba(15,61,46,0.62) 100%)",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.06), transparent 38%, transparent 62%, rgba(0,0,0,0.06))",
          }}
        />
      </div>

      {/* Main identity card */}
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          boxSizing: "border-box",
          margin: "-52px auto 0",
          padding: `0 ${t.spacing["4"]}`,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: t.colors.white,
            borderRadius: t.radius.lg,
            boxShadow: t.shadows.md,
            border: mutedBorder,
            padding: t.spacing["4"],
          }}
        >
          {/* Identity */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: t.spacing["4"],
              flexWrap: "wrap",
            }}
          >
            {/* Logo */}
            <div
              style={{
                position: "relative",
                flexShrink: 0,
                marginTop: -42,
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: t.radius.full,
                  border: `4px solid ${t.colors.white}`,
                  background: store.logo
                    ? `url(${store.logo}) center/cover`
                    : t.colors.gold[100],
                  boxShadow: t.shadows.md,
                }}
              />

              {store.isVerified && (
                <span
                  title="متجر موثّق"
                  style={{
                    position: "absolute",
                    right: 2,
                    bottom: 2,
                    width: 24,
                    height: 24,
                    borderRadius: t.radius.full,
                    background: t.colors.primary[800],
                    border: `2px solid ${t.colors.white}`,
                    color: t.colors.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: t.shadows.sm,
                  }}
                >
                  <BadgeCheck size={13} strokeWidth={2.2} />
                </span>
              )}
            </div>

            {/* Name + description */}
            <div
              style={{
                flex: "1 1 360px",
                minWidth: 240,
                paddingTop: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    color: t.colors.text.dark,
                    fontSize: t.typography.fontSize["2xl"],
                    fontWeight: t.typography.fontWeight.bold,
                    lineHeight: 1.3,
                  }}
                >
                  {store.nameAr}
                </h1>

                {store.isVerified && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: t.radius.full,
                      background: t.colors.primary[100],
                      color: t.colors.primary[800],
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.bold,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <BadgeCheck size={12} strokeWidth={2} />
                    موثّق
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 5,
                  color: t.colors.text.mid,
                  fontSize: t.typography.fontSize.xs,
                  lineHeight: 1.6,
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
                  {store.city ?? "المملكة العربية السعودية"}
                  {store.region ? `، ${store.region}` : ""}
                </span>

                {yearsActive > 0 && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>
                      نشط منذ {yearsActive}{" "}
                      {yearsActive === 1 ? "سنة" : "سنوات"}
                    </span>
                  </>
                )}
              </div>

              {store.shortDesc && (
                <p
                  style={{
                    maxWidth: 700,
                    margin: `${t.spacing["2"]} 0 0`,
                    color: t.colors.text.body,
                    fontSize: t.typography.fontSize.sm,
                    lineHeight: 1.7,
                  }}
                >
                  {store.shortDesc}
                </p>
              )}
            </div>

            {/* Video */}
            {store.publicInfo?.videoUrl && (
              <a
                href={store.publicInfo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="basita-card-interactive"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 10px",
                  background: t.colors.primary[900],
                  borderRadius: t.radius.md,
                  textDecoration: "none",
                  flexShrink: 0,
                  marginTop: 0,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: t.radius.full,
                    background: t.colors.gold[600],
                    color: t.colors.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Play
                    size={12}
                    strokeWidth={1.8}
                    fill={t.colors.white}
                  />
                </span>

                <span
                  style={{
                    color: t.colors.text.onDark,
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                  }}
                >
                  فيديو المتجر
                </span>
              </a>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              gap: t.spacing["2"],
              marginTop: t.spacing["4"],
              padding: `${t.spacing["3"]} 0`,
              borderTop: `1px solid ${t.colors.cream.border}`,
              borderBottom: `1px solid ${t.colors.cream.border}`,
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            <Stat value={String(store.totalProducts)} label="منتج" />

            <Stat
              value={`${store.totalOrders}+`}
              label="طلب مكتمل"
            />

            {store.totalReviews > 0 && (
              <Stat
                value={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                    }}
                  >
                    <Star
                      size={14}
                      strokeWidth={2}
                      fill={t.colors.gold[600]}
                      color={t.colors.gold[600]}
                    />
                    {store.avgRating.toFixed(1)}
                  </span>
                }
                label={`${store.totalReviews} مراجعة`}
              />
            )}

            <Stat
              value={String(followers)}
              label="متابع"
            />
          </div>

          {/* Bottom information + actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: t.spacing["3"],
              flexWrap: "wrap",
              marginTop: t.spacing["3"],
            }}
          >
            {/* Shipping */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: t.colors.primary[800],
                fontSize: t.typography.fontSize.xs,
                lineHeight: 1.6,
              }}
            >
              <Truck size={14} strokeWidth={1.8} />

              <span>
                يشحن إلى{" "}
                <strong
                  style={{
                    fontWeight: t.typography.fontWeight.bold,
                  }}
                >
                  {store.publicInfo?.shippingCoverage ??
                    "كل مناطق المملكة"}
                </strong>
              </span>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: t.spacing["2"],
                flexWrap: "wrap",
                marginInlineStart: "auto",
              }}
            >
              <button
                type="button"
                onClick={toggle}
                disabled={busy}
                className="basita-btn-interactive"
                style={{
                  minHeight: 36,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "7px 12px",
                  background: following
                    ? t.colors.primary[100]
                    : t.colors.white,
                  color: following
                    ? t.colors.primary[800]
                    : t.colors.text.body,
                  border: `1.5px solid ${
                    following
                      ? t.colors.primary[800]
                      : t.colors.cream.border
                  }`,
                  borderRadius: t.radius.full,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  cursor: busy ? "wait" : "pointer",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                <Heart
                  size={14}
                  strokeWidth={1.8}
                  fill={
                    following
                      ? t.colors.primary[800]
                      : "none"
                  }
                />
                {following ? "بالمفضلة" : "متابعة"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="basita-btn-interactive"
                style={{
                  minHeight: 36,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "7px 12px",
                  background: t.colors.white,
                  color: t.colors.text.body,
                  border: `1.5px solid ${t.colors.cream.border}`,
                  borderRadius: t.radius.full,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                }}
              >
                {shared ? (
                  <>
                    <Check size={14} strokeWidth={2} />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Share2 size={14} strokeWidth={1.8} />
                    مشاركة
                  </>
                )}
              </button>

              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(
                    "+",
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="basita-btn-interactive"
                  style={{
                    minHeight: 36,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "7px 12px",
                    background: t.colors.brand.whatsapp,
                    color: t.colors.white,
                    borderRadius: t.radius.full,
                    textDecoration: "none",
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.bold,
                  }}
                >
                  واتساب
                </a>
              )}

              <a
                href="#products"
                className="basita-btn-interactive"
                style={{
                  minHeight: 38,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: t.colors.primary[800],
                  color: t.colors.text.onDark,
                  borderRadius: t.radius.full,
                  textDecoration: "none",
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                }}
              >
                <ShoppingBag size={14} strokeWidth={1.8} />
                تصفّح المنتجات
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        minWidth: 85,
        flex: "1 1 85px",
        padding: `0 ${t.spacing["2"]}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 24,
          color: t.colors.primary[800],
          fontSize: t.typography.fontSize.lg,
          fontWeight: t.typography.fontWeight.bold,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 2,
          color: t.colors.text.mid,
          fontSize: "12px",
          lineHeight: 1.5,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
}