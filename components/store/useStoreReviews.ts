// components/store/useStoreReviews.ts
// تحميل تقييمات المتجر (6 في كل صفحة) مع «عرض المزيد».
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { StoreReviewsResponse } from "./types";

export function useStoreReviews(slug: string) {
  const [data, setData] = useState<StoreReviewsResponse | null>(null);
  const [reviews, setReviews] = useState<StoreReviewsResponse["reviews"]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get<StoreReviewsResponse>(`/api/stores/${slug}/reviews?page=${page}&limit=6`)
      .then((res) => {
        if (!active) return;
        setData(res);
        setReviews((prev) => (page === 1 ? res.reviews : [...prev, ...res.reviews]));
      })
      .catch(() => {
        if (!active) return;
        if (page === 1) {
          setData(null);
          setReviews([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, page]);

  const hasMore = Boolean(data && data.total > data.page * data.limit);
  return { data, reviews, loading, page, hasMore, loadMore: () => setPage((p) => p + 1) };
}
