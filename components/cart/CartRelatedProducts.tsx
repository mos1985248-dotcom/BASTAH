// components/cart/CartRelatedProducts.tsx
"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import ProductCard, { MarketplaceProduct } from "@/components/marketplace/ProductCard";

export default function CartRelatedProducts({ excludeProductIds }: { excludeProductIds: string[] }) {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<{ products: MarketplaceProduct[] }>("/api/products?sort=popular&limit=12")
      .then((res) => setItems(res.products.filter((p) => !excludeProductIds.includes(p.id)).slice(0, 8)))
      .catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeProductIds.join(",")]);

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
      window.location.href = "/login?redirect=/cart";
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
      <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: `0 0 ${t.spacing["4"]}` }}>
        <Sparkles size={20} strokeWidth={1.8} color={t.colors.gold[600]} />
        قد يعجبك أيضاً
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: t.spacing["4"] }}>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} isFavorite={favoriteIds.has(p.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </section>
  );
}
