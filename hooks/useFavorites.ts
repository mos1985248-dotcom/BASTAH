// hooks/useFavorites.ts
// المفضلة (قائمة الأمنيات): تحميل معرّفات المستخدم + تبديل متفائل مع تراجع عند الفشل.
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "@/app/providers";

export function useFavorites(loginHref = "/login") {
  const { user } = useCurrentUser();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    api
      .get<{ items: { product: { id: string } }[] }>("/api/wishlist")
      .then((data) => setFavoriteIds(new Set(data.items.map((item) => item.product.id))))
      .catch(() => {});
  }, [user]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      window.location.href = loginHref;
      return;
    }
    const isFav = favoriteIds.has(productId);
    const flip = (on: boolean) =>
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (on) next.add(productId);
        else next.delete(productId);
        return next;
      });
    flip(!isFav);
    try {
      if (isFav) await api.delete(`/api/wishlist/${productId}`);
      else await api.post("/api/wishlist", { productId });
    } catch {
      flip(isFav);
    }
  };

  return { favoriteIds, toggleFavorite };
}
