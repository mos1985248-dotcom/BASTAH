// components/cart/CartRelatedProducts.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { useFavorites } from "@/hooks/useFavorites";
import ProductCard, { MarketplaceProduct } from "@/components/marketplace/ProductCard";
import p from "@/components/product/product.module.css";
import x from "@/components/product/extras.module.css";

export default function CartRelatedProducts({ excludeProductIds }: { excludeProductIds: string[] }) {
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const { favoriteIds, toggleFavorite } = useFavorites("/login?redirect=/cart");

  useEffect(() => {
    api
      .get<{ products: MarketplaceProduct[] }>("/api/products?sort=popular&limit=12")
      .then((res) =>
        setItems(res.products.filter((pr) => !excludeProductIds.includes(pr.id)).slice(0, 8)),
      )
      .catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeProductIds.join(",")]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="cart-related-title" style={{ ...uiVars, marginTop: 56 }}>
      <p className={p.sectionKicker}>قد يعجبك أيضاً</p>
      <h2 id="cart-related-title" className={p.sectionTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
        قد يعجبك أيضاً
      </h2>
      <p className={p.sectionSub}>منتجات شائعة قد تكمل مشترياتك</p>
      <div className={x.related}>
        {items.map((item) => (
          <ProductCard key={item.id} product={item} isFavorite={favoriteIds.has(item.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </section>
  );
}
