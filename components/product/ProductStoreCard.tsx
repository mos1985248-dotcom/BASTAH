// components/product/ProductStoreCard.tsx
import { t } from "@/theme";
import { BadgeCheck, Star, Heart, ArrowLeft } from "lucide-react";
import { useStoreFollow } from "@/hooks/useStoreFollow";
import { ProductStore } from "./types";

export default function ProductStoreCard({ store, redirectPath }: { store: ProductStore; redirectPath: string }) {
  const { following, followers, busy, toggle } = useStoreFollow(store.slug, !!store.isFollowing, store.totalFollowers, redirectPath);

  return (
    <div style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, padding: t.spacing["4"], display: "flex", alignItems: "center", gap: t.spacing["3"], flexWrap: "wrap" }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: t.radius.full,
          background: store.logo ? `url(${store.logo}) center/cover` : t.colors.gold[100],
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 140 }}>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, display: "flex", alignItems: "center", gap: 4 }}>
          {store.nameAr}
          {store.isVerified && <BadgeCheck size={14} strokeWidth={1.8} color={t.colors.primary[800]} />}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: t.typography.fontSize.xs, color: t.colors.gold[600], display: "flex", alignItems: "center", gap: 4 }}>
          {store.totalReviews > 0 && (
            <>
              <Star size={11} strokeWidth={1.8} color={t.colors.gold[600]} fill={t.colors.gold[600]} />
              {store.avgRating.toFixed(1)} ({store.totalReviews}) ·
            </>
          )}
          {followers} متابع
        </p>
      </div>

      <div style={{ display: "flex", gap: t.spacing["2"] }}>
        <button
          onClick={toggle}
          disabled={busy}
          className="basita-btn-interactive"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "8px 14px",
            background: following ? t.colors.primary[100] : t.colors.white,
            color: t.colors.primary[800],
            border: `1.5px solid ${t.colors.primary[800]}`,
            borderRadius: t.radius.full,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
          }}
        >
          <Heart size={13} strokeWidth={1.8} fill={following ? t.colors.primary[800] : "none"} />
          {following ? "بالمتابعة" : "متابعة"}
        </button>
        <a
          href={`/store/${store.slug}`}
          className="basita-btn-interactive"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: t.colors.primary[800], color: t.colors.white, borderRadius: t.radius.full, textDecoration: "none", fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, whiteSpace: "nowrap" }}
        >
          عرض المتجر
          <ArrowLeft size={13} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
