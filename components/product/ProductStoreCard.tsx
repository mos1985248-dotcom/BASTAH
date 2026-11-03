// components/product/ProductStoreCard.tsx
"use client";
import { BadgeCheck, Star, Users } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import { useStoreFollow } from "@/hooks/useStoreFollow";
import type { ProductStore } from "./types";
import s from "./extras.module.css";

export default function ProductStoreCard({ store, redirectPath }: { store: ProductStore; redirectPath: string }) {
  const { following, followers, busy, toggle } = useStoreFollow(
    store.slug,
    !!store.isFollowing,
    store.totalFollowers,
    redirectPath,
  );
  const initial = store.nameAr.trim().charAt(0);

  return (
    <div className={s.store} style={uiVars}>
      <span className={s.storeLogo} style={store.logo ? { backgroundImage: `url(${store.logo})` } : undefined} aria-hidden="true">
        {!store.logo && initial}
      </span>
      <div className={s.storeBody}>
        <a href={`/store/${store.slug}`} className={s.storeName}>
          {store.nameAr}
          {store.isVerified && <BadgeCheck size={17} strokeWidth={1.9} aria-label="متجر موثّق" />}
        </a>
        <div className={s.storeMeta}>
          {store.totalReviews > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Star size={13} strokeWidth={1.8} fill="currentColor" aria-hidden="true" />
              {store.avgRating.toFixed(1)} ({store.totalReviews})
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Users size={13} strokeWidth={1.8} aria-hidden="true" />
            {followers} متابع
          </span>
        </div>
      </div>
      <div className={s.storeActions}>
        <button
          type="button"
          className={`${s.pill} ${following ? s.pillOn : ""}`}
          onClick={toggle}
          disabled={busy}
          aria-pressed={following}
          aria-label={following ? "إلغاء متابعة المتجر" : "متابعة المتجر"}
        >
          {following ? "بالمتابعة" : "متابعة"}
        </button>
        <a href={`/store/${store.slug}`} className={s.pill}>عرض المتجر</a>
      </div>
    </div>
  );
}
