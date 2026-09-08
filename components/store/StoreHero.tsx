// components/store/StoreHero.tsx
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { BadgeCheck, MapPin, Play, Truck, Heart, Share2, Check, ShoppingBag, Star } from "lucide-react";
import { t } from "@/theme";
import { shareContent } from "@/lib/share";
import { useStoreFollow } from "@/hooks/useStoreFollow";
import { yearsActiveFrom } from "@/lib/store-helpers";
import { StoreDetail } from "./types";

export default function StoreHero({ store }: { store: StoreDetail }) {
  const { following, followers, busy, toggle } = useStoreFollow(store.slug, !!store.isFollowing, store.totalFollowers, `/store/${store.slug}`);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const result = await shareContent({ title: store.nameAr, text: store.shortDesc ?? store.nameAr });
    if (result === "copied") {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const yearsActive = yearsActiveFrom(store.createdAt);

  return (
    <div style={{ direction: "rtl" }}>
      {/* الغلاف */}
      <div
        style={{
          height: 240,
          background: store.coverImage
            ? `url(${store.coverImage}) center/cover`
            : `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[700]})`,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,61,46,0.05), rgba(15,61,46,0.55))" }} />
      </div>

      <div style={{ maxWidth: 1080, margin: "-64px auto 0", padding: `0 ${t.spacing["4"]}`, position: "relative" }}>
        <div
          style={{
            background: t.colors.white,
            borderRadius: t.radius.xl,
            boxShadow: t.shadows.lg,
            padding: t.spacing["6"],
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: t.spacing["5"], flexWrap: "wrap", flexDirection: "row" }}>
            {/* الشعار */}
            <div style={{ position: "relative", flexShrink: 0, marginTop: -56 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: t.radius.full,
                  border: `4px solid ${t.colors.white}`,
                  background: store.logo ? `url(${store.logo}) center/cover` : t.colors.gold[100],
                  boxShadow: t.shadows.md,
                }}
              />
              {store.isVerified && (
                <span
                  title="متجر موثّق"
                  style={{
                    position: "absolute",
                    bottom: 2,
                    insetInlineEnd: 2,
                    width: 26,
                    height: 26,
                    borderRadius: t.radius.full,
                    background: t.colors.primary[800],
                    border: `2px solid ${t.colors.white}`,
                    color: t.colors.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BadgeCheck size={15} strokeWidth={2} />
                </span>
              )}
            </div>

            {/* الاسم والوصف */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize["2xl"],
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.text.dark,
                  display: "flex",
                  alignItems: "center",
                  gap: t.spacing["2"],
                  flexWrap: "wrap",
                }}
              >
                {store.nameAr}
                {store.isVerified && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: t.typography.fontSize.xs,
                      background: t.colors.primary[100],
                      color: t.colors.primary[800],
                      padding: "3px 10px",
                      borderRadius: t.radius.full,
                      fontWeight: t.typography.fontWeight.semibold,
                    }}
                  >
                    <BadgeCheck size={13} strokeWidth={1.8} />
                    متجر موثّق
                  </span>
                )}
              </h1>
              <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} strokeWidth={1.8} />
                  {store.city ?? "المملكة العربية السعودية"}{store.region ? `، ${store.region}` : ""}
                </span>
                {yearsActive > 0 && <span>· نشط منذ {yearsActive} {yearsActive === 1 ? "سنة" : "سنوات"}</span>}
              </p>
              {store.shortDesc && (
                <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: t.typography.fontSize.base, color: t.colors.text.body, lineHeight: t.typography.lineHeight.snug }}>
                  {store.shortDesc}
                </p>
              )}
            </div>

            {/* فيديو المتجر — يظهر فقط لو رفع التاجر رابطاً حقيقياً */}
            {store.publicInfo?.videoUrl && (
              <a
                href={store.publicInfo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="basita-card-interactive"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: t.spacing["2"],
                  padding: "10px 14px",
                  background: t.colors.primary[900],
                  borderRadius: t.radius.lg,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: t.radius.full,
                    background: t.colors.gold[600],
                    color: t.colors.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Play size={14} strokeWidth={1.8} fill={t.colors.white} />
                </span>
                <span style={{ color: t.colors.text.onDark, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold }}>
                  فيديو المتجر
                </span>
              </a>
            )}
          </div>

          {/* إحصاءات سريعة */}
          <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "space-around", gap: t.spacing["6"], marginTop: t.spacing["6"], padding: `${t.spacing["5"]} 0`, borderTop: `1px solid ${t.colors.cream.border}`, flexWrap: "wrap", textAlign: "center" }}>
            <Stat value={String(store.totalProducts)} label="منتج" />
            <Stat value={`${store.totalOrders}+`} label="طلب مكتمل" />
            {store.totalReviews > 0 && (
              <Stat
                value={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Star size={16} strokeWidth={2} fill={t.colors.gold[600]} color={t.colors.gold[600]} />
                    {store.avgRating.toFixed(1)}
                  </span>
                }
                label={`(${store.totalReviews} مراجعة)`}
              />
            )}
            <Stat value={String(followers)} label="متابع" />
          </div>

          <p style={{ margin: `0 0 ${t.spacing["4"]}`, display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, color: t.colors.primary[800] }}>
            <Truck size={15} strokeWidth={1.8} />
            يشحن إلى {store.publicInfo?.shippingCoverage ?? "كل مناطق المملكة"}
          </p>

          {/* أزرار الإجراءات */}
          <div style={{ display: "flex", flexDirection: "row", gap: t.spacing["3"], flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={toggle}
              disabled={busy}
              className="basita-btn-interactive"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                background: following ? t.colors.primary[100] : t.colors.white,
                color: following ? t.colors.primary[800] : t.colors.text.body,
                border: `1.5px solid ${following ? t.colors.primary[800] : t.colors.cream.border}`,
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              <Heart size={15} strokeWidth={1.8} fill={following ? t.colors.primary[800] : "none"} />
              {following ? "بالمفضلة" : "إضافة للمفضلة"}
            </button>

            <button
              onClick={handleShare}
              className="basita-btn-interactive"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                background: t.colors.white,
                color: t.colors.text.body,
                border: `1.5px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              {shared ? (
                <>
                  <Check size={15} strokeWidth={2} />
                  تم النسخ
                </>
              ) : (
                <>
                  <Share2 size={15} strokeWidth={1.8} />
                  مشاركة
                </>
              )}
            </button>

            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="basita-btn-interactive"
                style={{ padding: "10px 18px", background: t.colors.brand.whatsapp, color: t.colors.white, borderRadius: t.radius.full, textDecoration: "none", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}
              >
                واتساب
              </a>
            )}

            <a
              href="#products"
              className="basita-btn-interactive"
              style={{ display: "flex", alignItems: "center", gap: 6, marginInlineStart: "auto", padding: "10px 22px", background: t.colors.primary[800], color: t.colors.text.onDark, borderRadius: t.radius.full, textDecoration: "none", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}
            >
              <ShoppingBag size={15} strokeWidth={1.8} />
              تصفّح المنتجات
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <div style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{value}</div>
      <div style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, marginTop: 2 }}>{label}</div>
    </div>
  );
}