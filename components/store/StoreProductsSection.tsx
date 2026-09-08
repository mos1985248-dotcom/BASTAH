// components/store/StoreProductsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import ProductCard, { MarketplaceProduct } from "@/components/marketplace/ProductCard";
import Skeleton from "@/components/ui/Skeleton";

export default function StoreProductsSection({ storeId }: { storeId: string }) {
  const { user } = useCurrentUser();
  const [bestSellers, setBestSellers] = useState<MarketplaceProduct[]>([]);
  const [newest, setNewest] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      api.get<{ products: MarketplaceProduct[] }>(`/api/products?storeId=${storeId}&sort=popular&limit=8`),
      api.get<{ products: MarketplaceProduct[] }>(`/api/products?storeId=${storeId}&sort=newest&limit=8`),
    ])
      .then(([pop, recent]) => {
        setBestSellers(pop.products);
        setNewest(recent.products);
      })
      .catch(() => {
        setBestSellers([]);
        setNewest([]);
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    api
      .get<{ items: { product: { id: string } }[] }>("/api/wishlist")
      .then((d) => setFavoriteIds(new Set(d.items.map((i) => i.product.id))))
      .catch(() => {});
  }, [user]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const isFav = favoriteIds.has(productId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      if (isFav) await api.delete(`/api/wishlist/${productId}`);
      else await api.post("/api/wishlist", { productId });
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(productId) : next.delete(productId);
        return next;
      });
    }
  };

  return (
    <section id="products" style={{ maxWidth: 1080, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]}`, direction: "rtl" }}>
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["6"] }}>
          <div>
            <Skeleton width="30%" height={24} style={{ marginBottom: t.spacing["4"] }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: t.spacing["4"] }}>
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} height={220} radius={t.radius.lg} />
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && bestSellers.length === 0 && newest.length === 0 && (
        <div style={{ textAlign: "center", padding: `${t.spacing["12"]} 0`, color: t.colors.text.mid, fontSize: t.typography.fontSize.base }}>
          لا توجد منتجات بعد في هذا المتجر
        </div>
      )}

      {bestSellers.length > 0 && (
        <ProductRow title="الأكثر مبيعاً" products={bestSellers} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} rankBadgeFirst="الأكثر مبيعاً" />
      )}
      {newest.length > 0 && (
        <div style={{ marginTop: t.spacing["10"] }}>
          <ProductRow title="أحدث المنتجات" products={newest} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
        </div>
      )}
    </section>
  );
}

function ProductRow({
  title,
  products,
  favoriteIds,
  onToggleFavorite,
  rankBadgeFirst,
}: {
  title: string;
  products: MarketplaceProduct[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  rankBadgeFirst?: string;
}) {
  return (
    <div>
      <h2 style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: `0 0 ${t.spacing["4"]}` }}>
        {title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: t.spacing["4"], direction: "rtl" }}>
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            badge={rankBadgeFirst && i === 0 ? rankBadgeFirst : undefined}
            isFavorite={favoriteIds.has(p.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}