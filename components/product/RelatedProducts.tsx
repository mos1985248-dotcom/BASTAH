// components/product/RelatedProducts.tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { useFavorites } from "@/hooks/useFavorites";
import ProductCard, { type MarketplaceProduct } from "@/components/marketplace/ProductCard";
import p from "./product.module.css";
import x from "./extras.module.css";
import type { ProductDetail } from "./types";

export default function RelatedProducts({ product }: { product: ProductDetail }) {
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const { favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    let active = true;
    const qs = product.category?.slug
      ? `category=${encodeURIComponent(product.category.slug)}`
      : `storeId=${product.store.id}`;
    api
      .get<{ products: MarketplaceProduct[] }>(`/api/products?${qs}&limit=9&sort=popular`)
      .then((data) => active && setItems(data.products.filter((x) => x.id !== product.id).slice(0, 8)))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [product.id, product.category?.slug, product.store.id]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-title" style={uiVars}>
      <p className={p.sectionKicker}>قد يعجبك أيضًا</p>
      <h2 id="related-title" className={p.sectionTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
        منتجات مشابهة
      </h2>
      <p className={p.sectionSub}>اختيارات من نفس القسم</p>
      <div className={x.related}>
        {items.map((item) => (
          <ProductCard key={item.id} product={item} isFavorite={favoriteIds.has(item.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </section>
  );
}
