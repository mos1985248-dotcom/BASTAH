// components/store/StoreProductsSection.tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { useFavorites } from "@/hooks/useFavorites";
import type { MarketplaceProduct } from "@/components/marketplace/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import card from "@/components/marketplace/card.module.css";
import StoreProductRow from "./StoreProductRow";
import s from "./sections.module.css";

export default function StoreProductsSection({ storeId }: { storeId: string }) {
  const [bestSellers, setBestSellers] = useState<MarketplaceProduct[]>([]);
  const [newest, setNewest] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<{ products: MarketplaceProduct[] }>(`/api/products?storeId=${storeId}&sort=popular&limit=8`),
      api.get<{ products: MarketplaceProduct[] }>(`/api/products?storeId=${storeId}&sort=newest&limit=8`),
    ])
      .then(([pop, recent]) => {
        if (!active) return;
        setBestSellers(pop.products);
        setNewest(recent.products);
      })
      .catch(() => {
        if (!active) return;
        setBestSellers([]);
        setNewest([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [storeId]);

  const empty = !loading && bestSellers.length === 0 && newest.length === 0;

  return (
    <section
      id="products"
      aria-label="منتجات المتجر"
      aria-busy={loading}
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.head}>
        <p className={s.kicker}>من بسطة هذا المتجر</p>
        <h2 className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>منتجات المتجر</h2>
      </div>

      {loading && (
        <div className={s.grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={card.skeleton}>
              <Skeleton height={200} radius="0" />
              <div className={card.skeletonBody}>
                <Skeleton height={12} width="45%" />
                <Skeleton height={16} />
                <Skeleton height={18} width="35%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {empty && <EmptyState title="لا توجد منتجات بعد في هذا المتجر" description="تابع المتجر ليصلك جديده." />}

      {!loading && !empty && (
        <div className={s.rows}>
          <StoreProductRow
            title="الأكثر مبيعًا"
            subtitle="المنتجات التي يفضّلها عملاء المتجر"
            products={bestSellers}
            rankBadgeFirst="الأكثر مبيعًا"
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
          <StoreProductRow
            title="أحدث المنتجات"
            subtitle="أضيفت مؤخرًا إلى المتجر"
            products={newest}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      )}
    </section>
  );
}
