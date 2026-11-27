"use client";
import { useEffect, useState, type SyntheticEvent } from "react";
// components/home/StallCard.tsx
// بطاقة بسطة تراثية: اسم المتجر يظهر مرة واحدة فقط على اللافتة.
import { ArrowLeft, BadgeCheck, Heart, MapPin, Star, Store } from "lucide-react";
import type { HomeStore } from "./StoreCard";
import s from "./stalls.module.css";

// Merchant images can come from external URLs. Keep the fallback available on load errors.
function hideFailedImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true;
}

export default function StallCard({ store, fluid, reveal = false, compact = false }: { store: HomeStore; fluid?: boolean; reveal?: boolean; compact?: boolean }) {
  const [favorite, setFavorite] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bastah:fav-stores") || "[]") as unknown;
      setFavorite(Array.isArray(saved) && saved.includes(store.slug));
    } catch { setFavorite(false); }
  }, [store.slug]);
  const toggleFavorite = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("bastah:fav-stores") || "[]") as unknown;
      const list = Array.isArray(saved) ? saved.filter((v): v is string => typeof v === "string") : [];
      const next = list.includes(store.slug) ? list.filter(v => v !== store.slug) : [...list, store.slug];
      localStorage.setItem("bastah:fav-stores", JSON.stringify(next));
      setFavorite(next.includes(store.slug));
    } catch { /* local storage may be disabled */ }
  };
  // Optional images are rendered only if the existing API supplies them.
  // Do not substitute repeated or invented product photos.
  const extended = store as HomeStore & {
    productImages?: string[];
    products?: Array<{ image?: string | null; imageUrl?: string | null; images?: string[] | null }>;
  };
  const productImages = (extended.productImages ?? extended.products?.flatMap((p) =>
    p.image ? [p.image] : p.imageUrl ? [p.imageUrl] : p.images?.slice(0, 1) ?? []
  ) ?? []).filter((url): url is string => typeof url === "string" && url.length > 0).slice(0, 3);
  const hasProducts = productImages.length > 0;
  const nameSign = (
    <span className={s.woodSign}>
      <span className={s.name}>
        <span className={s.nameText} title={compact ? store.nameAr : undefined}>{store.nameAr}</span>
        {store.isVerified && <BadgeCheck size={16} strokeWidth={1.9} className={s.verified} aria-label="متجر موثّق" />}
      </span>
    </span>
  );
  return (
    <div className={`${s.stall} ${fluid ? s.fluid : ""} ${compact ? s.compact : ""}`} data-home-reveal={reveal ? "" : undefined}>
      <button type="button" className={`${s.favorite} ${favorite ? s.favoriteActive : ""}`}
        onClick={toggleFavorite} aria-pressed={favorite}
        aria-label={favorite ? `إزالة ${store.nameAr} من المفضلة على هذا الجهاز` : `حفظ ${store.nameAr} في المفضلة على هذا الجهاز`}
        title="مفضلة المتاجر محفوظة على هذا الجهاز فقط">
        <Heart size={18} fill={favorite ? "currentColor" : "none"} strokeWidth={2} />
      </button>
      <a href={`/store/${store.slug}`} className={s.stallLink} aria-label={`ادخل بسطة ${store.nameAr}`}>
      <span className={s.stallRoof} aria-hidden="true">
        <span className={s.roofEdge} />
      </span>
      <span className={s.stallFrame}>
        <span className={s.stallScene}>
          <span className={s.cover} aria-hidden="true">
            <span className={s.coverMark}><Store size={30} strokeWidth={1.5} /></span>
            {store.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={store.coverImage} className={s.coverImage} src={store.coverImage} alt="" onError={hideFailedImage} />
            )}
          </span>
          <span className={s.sceneGlow} aria-hidden="true" />
          {!compact && nameSign}
          {hasProducts && (
            <span className={s.sceneProducts} aria-hidden="true">
              {productImages.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${url}-${i}`} className={s.sceneProduct} src={url} alt="" onError={hideFailedImage} />
              ))}
            </span>
          )}
          <span className={s.counter} aria-hidden="true" />
        </span>
        {compact && nameSign}
        <span className={s.info}>
          <span className={s.infoTop}>
            <span className={s.logo} aria-hidden="true">
              <Store size={22} strokeWidth={1.7} />
              {store.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={store.logo} className={s.logoImage} src={store.logo} alt="" onError={hideFailedImage} />
              )}
            </span>
            {(!compact || store.city) && <span className={s.meta}>
              <MapPin size={14} strokeWidth={1.9} aria-hidden="true" />
              <span title={compact ? store.city : undefined}>{store.city}</span>
            </span>}
            <span className={s.rating} aria-label={store.totalReviews > 0 ? `التقييم ${store.avgRating.toFixed(1)} من 5، ${store.totalReviews} تقييم` : "لا توجد تقييمات بعد"}>
              <Star size={14} fill={store.totalReviews > 0 ? "currentColor" : "none"} strokeWidth={1.5} aria-hidden="true" />
              {store.totalReviews > 0 ? `${store.avgRating.toFixed(1)} (${store.totalReviews})` : "جديد"}
            </span>
          </span>
          {store.shortDesc && <span className={s.desc}>{store.shortDesc}</span>}
          <span className={s.enter}>
            <Store size={17} strokeWidth={1.9} aria-hidden="true" />
            ادخل البسطة
            <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
          </span>
        </span>
      </span>
    </a>
    </div>
  );
}
