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
        maxWidth: 1200,
        margin: "0 auto",
        padding: `${t.spacing["10"]} ${t.spacing["5"]} ${t.spacing["12"]}`,
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
            gap: t.spacing["2"],
            marginBottom: t.spacing["6"],
          }}
        >
          {bannerImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              aria-hidden="true"
              style={{
                height: 96,
                borderRadius: t.radius.lg,
                backgroundImage: `url(${src})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                boxShadow: t.shadows.sm,
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
          borderRadius: t.radius.xl,
          padding: `${t.spacing["8"]} ${t.spacing["6"]}`,
          textAlign: "center",
          boxShadow: t.shadows.md,
        }}
      >
        {/* زخرفة بسيطة */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -45,
            left: -45,
            width: 130,
            height: 130,
            borderRadius: t.radius.full,
            background: "rgba(255,255,255,0.035)",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -55,
            right: -35,
            width: 150,
            height: 150,
            borderRadius: t.radius.full,
            background: "rgba(221,179,95,0.06)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <Heart
              size={21}
              strokeWidth={1.8}
              fill={t.colors.gold[400]}
              color={t.colors.gold[400]}
            />
          </div>

          <h2
            style={{
              margin: 0,
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.7,
            }}
          >
            شكراً لدعمك للأسر المنتجة السعودية
          </h2>

          <p
            style={{
              maxWidth: 600,
              margin: `${t.spacing["2"]} auto ${t.spacing["6"]}`,
              color: t.colors.text.onDarkMuted,
              fontSize: t.typography.fontSize.base,
              lineHeight: 1.9,
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
              gap: 8,
              minHeight: 46,
              padding: "11px 28px",
              background: t.colors.gold[600],
              color: t.colors.primary[950],
              borderRadius: t.radius.full,
              textDecoration: "none",
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              boxShadow: t.shadows.sm,
            }}
          >
            <ShoppingBag size={18} strokeWidth={2} />
            تصفّح جميع المنتجات
          </a>
        </div>
      </div>
    </section>
  );
}