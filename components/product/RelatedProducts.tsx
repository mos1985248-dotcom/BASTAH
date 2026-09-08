// components/product/RelatedProducts.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import ProductCard, { MarketplaceProduct } from "@/components/marketplace/ProductCard";
import { ProductDetail } from "./types";

export default function RelatedProducts({ product }: { product: ProductDetail }) {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const qs = product.category?.slug
      ? `category=${encodeURIComponent(product.category.slug)}`
      : `storeId=${product.store.id}`;
    api
      .get<{ products: MarketplaceProduct[] }>(`/api/products?${qs}&limit=9&sort=popular`)
      .then((res) => setItems(res.products.filter((p) => p.id !== product.id).slice(0, 8)))
      .catch(() => setItems([]));
  }, [product.id, product.category?.slug, product.store.id]);

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
      window.location.href = `/login?redirect=/products/${product.id}`;
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

  if (items.length === 0) return null;

  return (
    <section style={{ marginTop: t.spacing["8"] }}>
      <h2 style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: `0 0 ${t.spacing["4"]}` }}>
        منتجات قد تعجبك
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: t.spacing["4"] }}>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} isFavorite={favoriteIds.has(p.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </section>
  );
}
