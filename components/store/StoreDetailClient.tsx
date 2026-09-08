// components/store/StoreDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import StoreHero from "@/components/store/StoreHero";
import StoreStoryAndBadges from "@/components/store/StoreStoryAndBadges";
import StoreAchievements from "@/components/store/StoreAchievements";
import StoreInfoGrid from "@/components/store/StoreInfoGrid";
import MuniraAdviceCard from "@/components/store/MuniraAdviceCard";
import StoreReviewsSection from "@/components/store/StoreReviewsSection";
import StoreProductsSection from "@/components/store/StoreProductsSection";
import StoreClosingBanner from "@/components/store/StoreClosingBanner";
import Skeleton from "@/components/ui/Skeleton";
import { StoreDetail } from "@/components/store/types";

export default function StoreDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { store } = await api.get<{ store: StoreDetail }>(`/api/stores/${slug}`);
        setStore(store);
        // تسجيل الزيارة — fire-and-forget، ما يوقف عرض الصفحة لو فشل
        api.post(`/api/stores/${slug}/visit`, {}).catch(() => {});
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "تعذّر تحميل المتجر");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <SiteShell>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: `${t.spacing["8"]} ${t.spacing["4"]}`, direction: "rtl" }}>
          <Skeleton height={220} radius={t.radius.xl} style={{ marginBottom: t.spacing["6"] }} />
          <div style={{ display: "flex", gap: t.spacing["4"], marginBottom: t.spacing["8"] }}>
            <Skeleton width={80} height={80} radius={t.radius.full} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: t.spacing["2"] }}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="70%" height={16} />
            </div>
          </div>
          <Skeleton height={100} radius={t.radius.xl} style={{ marginBottom: t.spacing["6"] }} />
          <Skeleton height={350} radius={t.radius.xl} />
        </div>
      </SiteShell>
    );
  }

  if (error || !store) {
    return (
      <SiteShell>
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", padding: t.spacing["16"], color: t.colors.semantic.danger, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, direction: "rtl" }}>
          <AlertTriangle size={18} strokeWidth={1.8} />
          {error || "المتجر غير موجود"}
        </p>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <StoreHero store={store} />
      <StoreStoryAndBadges store={store} />
      <StoreAchievements store={store} />
      <MuniraAdviceCard store={store} />
      <StoreInfoGrid store={store} />
      <StoreProductsSection storeId={store.id} />
      <StoreReviewsSection store={store} />
      <StoreClosingBanner store={store} />
    </SiteShell>
  );
}