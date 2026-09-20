// components/product/RelatedProducts.tsx

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import ProductCard, {
  MarketplaceProduct,
} from "@/components/marketplace/ProductCard";
import { ProductDetail } from "./types";

export default function RelatedProducts({
  product,
}: {
  product: ProductDetail;
}) {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const qs = product.category?.slug
      ? `category=${encodeURIComponent(
          product.category.slug
        )}`
      : `storeId=${product.store.id}`;

    api
      .get<{ products: MarketplaceProduct[] }>(
        `/api/products?${qs}&limit=9&sort=popular`
      )
      .then((res) =>
        setItems(
          res.products
            .filter((p) => p.id !== product.id)
            .slice(0, 8)
        )
      )
      .catch(() => setItems([]));
  }, [
    product.id,
    product.category?.slug,
    product.store.id,
  ]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    api
      .get<{ items: { product: { id: string } }[] }>(
        "/api/wishlist"
      )
      .then((d) =>
        setFavoriteIds(
          new Set(
            d.items.map((i) => i.product.id)
          )
        )
      )
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
      isFav
        ? next.delete(productId)
        : next.add(productId);
      return next;
    });

    try {
      if (isFav) {
        await api.delete(`/api/wishlist/${productId}`);
      } else {
        await api.post("/api/wishlist", {
          productId,
        });
      }
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav
          ? next.add(productId)
          : next.delete(productId);
        return next;
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section
      dir="rtl"
      className="basita-related-products"
      aria-labelledby="related-products-title"
      style={{
        marginTop: t.spacing["7"],
        paddingTop: t.spacing["5"],
        borderTop: `1px solid ${t.colors.cream.border}`,
      }}
    >
      {/* عنوان القسم */}
      <div
        className="basita-related-heading"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: t.spacing["3"],
          marginBottom: t.spacing["3"],
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 4,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 3,
                height: 21,
                borderRadius: t.radius.full,
                background: t.colors.gold[600],
                flexShrink: 0,
              }}
            />

            <h2
              id="related-products-title"
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.lg,
                fontWeight:
                  t.typography.fontWeight.bold,
                color: t.colors.text.dark,
                lineHeight: 1.35,
              }}
            >
              منتجات قد تعجبك
            </h2>
          </div>

          <p
            style={{
              margin: "0 0 0 10px",
              fontSize: 12,
              color: t.colors.text.mid,
              lineHeight: 1.55,
            }}
          >
            خيارات أخرى نعتقد أنها قد تناسبك
          </p>
        </div>

        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 3,
            marginBottom: 4,
            borderRadius: t.radius.full,
            background: t.colors.cream.border,
            flexShrink: 0,
          }}
        />
      </div>

      {/* المنتجات */}
      <div
        className="basita-related-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(170px, 1fr))",
          gap: t.spacing["3"],
        }}
      >
        {items.map((p) => (
          <div
            key={p.id}
            className="basita-related-card"
            style={{
              minWidth: 0,
              transition:
                "transform 180ms ease, filter 180ms ease",
            }}
          >
            <ProductCard
              product={p}
              isFavorite={favoriteIds.has(p.id)}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        ))}
      </div>

      <style>{`
        .basita-related-card:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .basita-related-grid {
            grid-template-columns:
              repeat(4, minmax(0, 1fr)) !important;
            gap: ${t.spacing["3"]} !important;
          }
        }

        @media (max-width: 700px) {
          .basita-related-products {
            margin-top: ${t.spacing["6"]} !important;
            padding-top: ${t.spacing["4"]} !important;
          }

          .basita-related-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: ${t.spacing["3"]} !important;
          }

          .basita-related-heading {
            align-items: flex-start !important;
          }

          .basita-related-heading > span {
            display: none !important;
          }
        }

        @media (max-width: 390px) {
          .basita-related-grid {
            gap: ${t.spacing["2"]} !important;
          }

          .basita-related-heading h2 {
            font-size: ${t.typography.fontSize.lg} !important;
          }

          .basita-related-heading p {
            margin-inline-start: 10px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-related-card {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}