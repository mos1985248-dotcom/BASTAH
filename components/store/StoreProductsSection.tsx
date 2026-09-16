// components/store/StoreProductsSection.tsx

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import ProductCard, {
  MarketplaceProduct,
} from "@/components/marketplace/ProductCard";
import Skeleton from "@/components/ui/Skeleton";

export default function StoreProductsSection({
  storeId,
}: {
  storeId: string;
}) {
  const { user } = useCurrentUser();

  const [bestSellers, setBestSellers] = useState<MarketplaceProduct[]>([]);
  const [newest, setNewest] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get<{ products: MarketplaceProduct[] }>(
        `/api/products?storeId=${storeId}&sort=popular&limit=8`
      ),
      api.get<{ products: MarketplaceProduct[] }>(
        `/api/products?storeId=${storeId}&sort=newest&limit=8`
      ),
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
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [storeId]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    api
      .get<{ items: { product: { id: string } }[] }>("/api/wishlist")
      .then((data) =>
        setFavoriteIds(
          new Set(data.items.map((item) => item.product.id))
        )
      )
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

      if (isFav) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });

    try {
      if (isFav) {
        await api.delete(`/api/wishlist/${productId}`);
      } else {
        await api.post("/api/wishlist", { productId });
      }
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);

        if (isFav) {
          next.add(productId);
        } else {
          next.delete(productId);
        }

        return next;
      });
    }
  };

  return (
    <section
      id="products"
      aria-label="منتجات المتجر"
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        padding: `${t.spacing["10"]} ${t.spacing["5"]}`,
        boxSizing: "border-box",
        direction: "rtl",
      }}
    >
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: t.spacing["8"],
          }}
        >
          <div>
            <div
              style={{
                width: 170,
                height: 24,
                marginBottom: t.spacing["4"],
              }}
            >
              <Skeleton width="100%" height={24} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(205px, 1fr))",
                gap: t.spacing["5"],
              }}
            >
              {[1, 2, 3, 4].map((n) => (
                <Skeleton
                  key={n}
                  height={285}
                  radius={t.radius.lg}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading &&
        bestSellers.length === 0 &&
        newest.length === 0 && (
          <div
            style={{
              padding: `${t.spacing["12"]} ${t.spacing["6"]}`,
              textAlign: "center",
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: t.radius.xl,
              background: t.colors.white,
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.base,
            }}
          >
            لا توجد منتجات بعد في هذا المتجر
          </div>
        )}

      {bestSellers.length > 0 && (
        <ProductRow
          title="الأكثر مبيعًا"
          subtitle="المنتجات التي يفضّلها عملاء المتجر"
          products={bestSellers}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          rankBadgeFirst="الأكثر مبيعًا"
        />
      )}

      {newest.length > 0 && (
        <div
          style={{
            marginTop:
              bestSellers.length > 0 ? t.spacing["12"] : 0,
          }}
        >
          <ProductRow
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

function ProductRow({
  title,
  subtitle,
  products,
  favoriteIds,
  onToggleFavorite,
  rankBadgeFirst,
}: {
  title: string;
  subtitle: string;
  products: MarketplaceProduct[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  rankBadgeFirst?: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: t.spacing["5"],
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize["2xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.4,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: t.colors.text.light,
              fontSize: t.typography.fontSize.sm,
              lineHeight: 1.7,
            }}
          >
            {subtitle}
          </p>
        </div>

        <span
          style={{
            flexShrink: 0,
            padding: "5px 10px",
            borderRadius: t.radius.full,
            background: t.colors.cream.warm,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
          }}
        >
          {products.length} منتجات
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(205px, 1fr))",
          gap: t.spacing["5"],
          direction: "rtl",
        }}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            badge={
              rankBadgeFirst && index === 0
                ? rankBadgeFirst
                : undefined
            }
            isFavorite={favoriteIds.has(product.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}