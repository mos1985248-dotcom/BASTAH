// components/store/StoreClosingBanner.tsx

import { Heart, ShoppingBag } from "lucide-react";
import { t } from "@/theme";
import { StoreDetail } from "./types";

export default function StoreClosingBanner({
  store,
}: {
  store: StoreDetail;
}) {
  const bannerImages = store.bannerImages?.slice(0, 5) ?? [];

  return (
    <section
      aria-label="رسالة ختامية للمتجر"
      style={{
        width: "100%",
        maxWidth: 1180,
        margin: "0 auto",
        padding: `${t.spacing["5"]} ${t.spacing["4"]} ${t.spacing["6"]}`,
        boxSizing: "border-box",
        direction: "rtl",
      }}
    >
      {bannerImages.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(
              bannerImages.length,
              5
            )}, minmax(0, 1fr))`,
            gap: 6,
            marginBottom: t.spacing["4"],
          }}
        >
          {bannerImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              aria-hidden="true"
              style={{
                height: 68,
                borderRadius: t.radius.md,
                backgroundImage: `url(${src})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                boxShadow: t.shadows.xs,
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[900]})`,
          borderRadius: t.radius.lg,
          padding: "22px 20px",
          textAlign: "center",
          boxShadow: t.shadows.sm,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -55,
            left: -55,
            width: 120,
            height: 120,
            borderRadius: t.radius.full,
            background: "rgba(255,255,255,0.035)",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -65,
            right: -45,
            width: 140,
            height: 140,
            borderRadius: t.radius.full,
            background: "rgba(221,179,95,0.055)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 650,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              margin: "0 auto 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <Heart
              size={17}
              strokeWidth={1.8}
              fill={t.colors.gold[400]}
              color={t.colors.gold[400]}
            />
          </div>

          <h2
            style={{
              margin: 0,
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.5,
            }}
          >
            شكراً لدعمك للأسر المنتجة السعودية
          </h2>

          <p
            style={{
              maxWidth: 560,
              margin: "5px auto 14px",
              color: t.colors.text.onDarkMuted,
              fontSize: t.typography.fontSize.sm,
              lineHeight: 1.7,
            }}
          >
            كل عملية شراء منك تدعم أسرة سعودية وتصنع فرقاً حقيقياً في حياتهم.
          </p>

          <a
            href="#products"
            className="basita-btn-interactive"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              minHeight: 40,
              padding: "8px 20px",
              background: t.colors.gold[600],
              color: t.colors.primary[950],
              borderRadius: t.radius.full,
              textDecoration: "none",
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              boxShadow: t.shadows.xs,
            }}
          >
            <ShoppingBag size={16} strokeWidth={2} />
            تصفّح جميع المنتجات
          </a>
        </div>
      </div>
    </section>
  );
}