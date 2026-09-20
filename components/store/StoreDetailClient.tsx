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
    let active = true;

    (async () => {
      try {
        const { store } = await api.get<{ store: StoreDetail }>(
          `/api/stores/${slug}`
        );

        if (!active) return;

        setStore(store);

        // تسجيل الزيارة — fire-and-forget
        api.post(`/api/stores/${slug}/visit`, {}).catch(() => {});
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

  /* ─────────────────────────────────────────
     Loading
  ───────────────────────────────────────── */

  if (loading) {
    return (
      <SiteShell>
        <main
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: `${t.spacing["6"]} ${t.spacing["4"]}`,
            boxSizing: "border-box",
            direction: "rtl",
          }}
        >
          <Skeleton
            height={220}
            radius={t.radius.lg}
            style={{ marginBottom: t.spacing["4"] }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: t.spacing["3"],
              marginBottom: t.spacing["4"],
            }}
          >
            <Skeleton
              width={72}
              height={72}
              radius={t.radius.full}
            />

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: t.spacing["2"],
              }}
            >
              <Skeleton width="32%" height={22} />
              <Skeleton width="55%" height={14} />
            </div>
          </div>

          <Skeleton
            height={90}
            radius={t.radius.lg}
            style={{ marginBottom: t.spacing["4"] }}
          />

          <Skeleton
            height={280}
            radius={t.radius.lg}
          />
        </main>
      </SiteShell>
    );
  }

  /* ─────────────────────────────────────────
     Error / Not found
  ───────────────────────────────────────── */

  if (error || !store) {
    return (
      <SiteShell>
        <main
          style={{
            minHeight: "55vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: t.spacing["8"],
            direction: "rtl",
          }}
        >
          <div
            role="alert"
            style={{
              width: "100%",
              maxWidth: 560,
              padding: t.spacing["6"],
              borderRadius: t.radius.xl,
              border: `1px solid ${t.colors.cream.border}`,
              background: t.colors.white,
              textAlign: "center",
              boxShadow: t.shadows.sm,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: `0 auto ${t.spacing["3"]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: t.colors.semantic.dangerBg,
                color: t.colors.semantic.danger,
              }}
            >
              <AlertTriangle size={21} strokeWidth={1.8} />
            </div>

            <h1
              style={{
                margin: 0,
                color: t.colors.text.dark,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              {error ? "تعذّر تحميل المتجر" : "المتجر غير موجود"}
            </h1>

            <p
              style={{
                margin: `${t.spacing["2"]} 0 0`,
                color: error
                  ? t.colors.text.mid
                  : t.colors.text.light,
                fontSize: t.typography.fontSize.sm,
                lineHeight: 1.8,
              }}
            >
              {error ||
                "قد يكون الرابط غير صحيح أو أن المتجر لم يعد متاحًا."}
            </p>
          </div>
        </main>
      </SiteShell>
    );
  }

  /* ─────────────────────────────────────────
     Store
  ───────────────────────────────────────── */

  return (
    <SiteShell>
      <main
        style={{
          width: "100%",
          direction: "rtl",
        }}
      >
        {/* رأس المتجر */}
        <StoreHero store={store} />

        {/* معلومات المتجر — في الأعلى وبحجم مختصر */}
        <StoreInfoGrid store={store} />

        {/* قصة المتجر والشارات */}
        <StoreStoryAndBadges store={store} />

        {/* إنجازات المتجر */}
        <StoreAchievements store={store} />

        {/* المنتجات */}
        <StoreProductsSection storeId={store.id} />

        {/* التقييمات */}
        <StoreReviewsSection store={store} />

        {/* ختام الصفحة */}
        <StoreClosingBanner store={store} />
      </main>
    </SiteShell>
  );
}