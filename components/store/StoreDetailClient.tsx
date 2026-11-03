// components/store/StoreDetailClient.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import StoreHero from "@/components/store/StoreHero";
import StoreStoryAndBadges from "@/components/store/StoreStoryAndBadges";
import StoreAchievements from "@/components/store/StoreAchievements";
import StoreInfoGrid from "@/components/store/StoreInfoGrid";
import StoreReviewsSection from "@/components/store/StoreReviewsSection";
import StoreProductsSection from "@/components/store/StoreProductsSection";
import StoreClosingBanner from "@/components/store/StoreClosingBanner";
import { StoreError, StoreLoading } from "@/components/store/StoreStates";
import { StoreDetail } from "@/components/store/types";

export default function StoreDetailClient() {
  const { slug } = useParams<{ slug: string }>();

  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { store } = await api.get<{ store: StoreDetail }>(
          `/api/stores/${slug}`
        );

        if (!active) return;

        setStore(store);

        // تسجيل الزيارة — fire-and-forget. نمرّر وسم utm الحالي (إن وُجد)
        // عبر رابط الطلب نفسه حتى يسجّله السيرفر ويحفظ كوكي الإسناد.
        const utmQuery = typeof window !== "undefined" ? window.location.search : "";
        api.post(`/api/stores/${slug}/visit${utmQuery}`, {}).catch(() => {});
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof ApiError
            ? err.message
            : "تعذّر تحميل المتجر"
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <SiteShell>
        <StoreLoading />
      </SiteShell>
    );
  }

  if (error || !store) {
    return (
      <SiteShell>
        <StoreError message={error} />
      </SiteShell>
    );
  }

  // الترتيب يخدم رحلة الشراء: الرأس ← المنتجات ← القصة والثقة ← المؤشرات والمعلومات ← التقييمات ← الختام
  return (
    <SiteShell>
      <main style={{ width: "100%", direction: "rtl", background: t.colors.heritage.sand }}>
        <StoreHero store={store} />
        <StoreProductsSection storeId={store.id} />
        <StoreStoryAndBadges store={store} />
        <StoreAchievements store={store} />
        <StoreInfoGrid store={store} />
        <StoreReviewsSection store={store} />
        <StoreClosingBanner store={store} />
      </main>
    </SiteShell>
  );
}
