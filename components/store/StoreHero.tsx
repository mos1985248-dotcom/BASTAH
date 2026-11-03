// components/store/StoreHero.tsx
"use client";
import { BadgeCheck, MapPin, Play, Truck } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { useStoreFollow } from "@/hooks/useStoreFollow";
import { yearsActiveFrom } from "@/lib/store-helpers";
import StoreHeroActions from "./StoreHeroActions";
import type { StoreDetail } from "./types";
import s from "./hero.module.css";

export default function StoreHero({ store }: { store: StoreDetail }) {
  const { following, followers, busy, toggle } = useStoreFollow(
    store.slug,
    !!store.isFollowing,
    store.totalFollowers,
    `/store/${store.slug}`,
  );
  const years = yearsActiveFrom(store.createdAt);
  const initial = store.nameAr.trim().charAt(0);
  const info = store.publicInfo;

  const stats: { value: string; label: string }[] = [
    { value: String(store.totalProducts), label: "منتج" },
    { value: `${store.totalOrders}+`, label: "طلب مكتمل" },
    ...(store.totalReviews > 0
      ? [{ value: store.avgRating.toFixed(1), label: `${store.totalReviews} مراجعة` }]
      : []),
    { value: String(followers), label: "متابع" },
  ];

  return (
    <section className={s.section} style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}>
      <div className={s.frame}>
        <div className={s.awning} aria-hidden="true" />
        <div className={s.cover} style={store.coverImage ? { backgroundImage: `url(${store.coverImage})` } : undefined} aria-hidden="true">
          {!store.coverImage && <span className={s.coverInitial} style={{ fontFamily: t.typography.fontFamily.display }}>{initial}</span>}
        </div>

        <div className={s.body}>
          <span className={s.logo} style={store.logo ? { backgroundImage: `url(${store.logo})` } : undefined} aria-hidden="true">
            {!store.logo && initial}
          </span>

          <div className={s.identity}>
            <h1 className={s.name} style={{ fontFamily: t.typography.fontFamily.display }}>
              {store.nameAr}
              {store.isVerified && <BadgeCheck size={24} strokeWidth={1.9} className={s.verified} aria-label="متجر موثّق" />}
            </h1>
            <p className={s.meta}>
              <span className={s.metaItem}>
                <MapPin size={15} strokeWidth={1.9} aria-hidden="true" />
                {store.city ?? "المملكة العربية السعودية"}
                {store.region ? `، ${store.region}` : ""}
              </span>
              <span className={s.metaItem}>
                <Truck size={15} strokeWidth={1.9} aria-hidden="true" />
                يشحن إلى {info?.shippingCoverage ?? "كل مناطق المملكة"}
              </span>
              {years > 0 && <span>نشط منذ {years} {years === 1 ? "سنة" : "سنوات"}</span>}
              {info?.videoUrl && (
                <a href={info.videoUrl} target="_blank" rel="noopener noreferrer" className={s.metaItem}>
                  <Play size={14} strokeWidth={1.9} aria-hidden="true" />
                  فيديو المتجر
                </a>
              )}
            </p>
            {store.shortDesc && <p className={s.desc}>{store.shortDesc}</p>}
          </div>

          <StoreHeroActions store={store} following={following} busy={busy} onToggleFollow={toggle} />
        </div>

        <ul className={s.stats}>
          {stats.map((st) => (
            <li key={st.label} className={s.stat}>
              <span className={s.statValue}>{st.value}</span>
              <span className={s.statLabel}>{st.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
