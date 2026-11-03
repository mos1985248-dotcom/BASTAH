// components/product/useProductReviews.ts — تقييمات المنتج (6 في كل صفحة) مع «عرض المزيد»
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { ProductReviewsResponse } from "./types";

export function useProductReviews(productId: string) {
  const [meta, setMeta] = useState<ProductReviewsResponse | null>(null);
  const [reviews, setReviews] = useState<ProductReviewsResponse["reviews"]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get<ProductReviewsResponse>(`/api/products/${productId}/reviews?page=${page}&limit=6`)
      .then((res) => {
        if (!active) return;
        setMeta(res);
        setReviews((prev) => (page === 1 ? res.reviews : [...prev, ...res.reviews]));
      })
      .catch(() => {
        if (!active || page !== 1) return;
        setMeta(null);
        setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, page]);

  const hasMore = Boolean(meta && meta.total > meta.page * meta.limit);
  return { meta, reviews, loading, page, hasMore, loadMore: () => setPage((p) => p + 1) };
}
