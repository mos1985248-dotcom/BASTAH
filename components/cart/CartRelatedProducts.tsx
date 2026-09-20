// components/cart/CartRelatedProducts.tsx

"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import ProductCard, {
  MarketplaceProduct,
} from "@/components/marketplace/ProductCard";

export default function CartRelatedProducts({
  excludeProductIds,
}: {
  excludeProductIds: string[];
}) {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    api
      .get<{ products: MarketplaceProduct[] }>(
        "/api/products?sort=popular&limit=12"
      )
      .then((res) =>
        setItems(
          res.products
            .filter(
              (p) => !excludeProductIds.includes(p.id)
            )
            .slice(0, 8)
        )
      )
      .catch(() => setItems([]));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeProductIds.join(",")]);

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
      window.location.href = "/login?redirect=/cart";
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
      className="basita-cart-related"
      aria-labelledby="cart-related-title"
      style={{
        marginTop: t.spacing["6"],
        paddingTop: t.spacing["5"],
        borderTop: `1px solid ${t.colors.cream.border}`,
      }}
    >
      {/* Section heading */}
      <div
        className="basita-cart-related-heading"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.spacing["3"],
          marginBottom: t.spacing["3"],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.md,
              background: t.colors.cream.warm,
              color: t.colors.gold[600],
            }}
          >
            <Sparkles
              size={17}
              strokeWidth={1.7}
            />
          </span>

          <div>
            <h2
              id="cart-related-title"
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
                lineHeight: 1.4,
              }}
            >
              قد يعجبك أيضاً
            </h2>

            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: t.colors.text.mid,
                lineHeight: 1.5,
              }}
            >
              منتجات شائعة قد تكمل مشترياتك
            </p>
          </div>
        </div>

        <span
          aria-hidden="true"
          style={{
            width: 34,
            height: 3,
            flexShrink: 0,
            borderRadius: t.radius.full,
            background: t.colors.cream.border,
          }}
        />
      </div>

      {/* Products */}
      <div
        className="basita-cart-related-grid"
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
            className="basita-cart-related-card"
            style={{
              minWidth: 0,
              transition:
                "transform 180ms ease",
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
        .basita-cart-related-card:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .basita-cart-related-grid {
            grid-template-columns:
              repeat(4, minmax(0, 1fr)) !important;
            gap: ${t.spacing["3"]} !important;
          }
        }

        @media (max-width: 700px) {
          .basita-cart-related {
            margin-top: ${t.spacing["6"]} !important;
            padding-top: ${t.spacing["4"]} !important;
          }

          .basita-cart-related-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: ${t.spacing["3"]} !important;
          }

          .basita-cart-related-heading > span {
            display: none !important;
          }
        }

        @media (max-width: 390px) {
          .basita-cart-related-grid {
            gap: ${t.spacing["2"]} !important;
          }

          .basita-cart-related-heading h2 {
            font-size: ${t.typography.fontSize.base} !important;
          }

          .basita-cart-related-heading > div > span {
            width: 32px !important;
            height: 32px !important;
          }

          .basita-cart-related-heading > div > span svg {
            width: 16px !important;
            height: 16px !important;
          }

          .basita-cart-related-heading p {
            font-size: 10px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-cart-related-card {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}