// components/marketplace/useMarketData.ts
// جلب قائمة (منتجات أو متاجر) مع ترقيم. enabled=false يوقف الجلب (التبويب غير النشط).
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";

type Pagination = { page: number; pages: number; total: number };

export function useMarketData<T>(
  resource: "products" | "stores",
  params: Record<string, string>,
  enabled: boolean,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const sig = JSON.stringify(params);
  const requestId = useRef(0);

  const load = useCallback(
    async (page = 1) => {
      const request = ++requestId.current;
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({ page: String(page), ...JSON.parse(sig) });
        const data = await api.get<Record<string, unknown>>(`/api/${resource}?${qs.toString()}`);
        if (request !== requestId.current) return;
        setItems(data[resource] as T[]);
        setPagination(data.pagination as Pagination);
      } catch (err) {
        if (request !== requestId.current) return;
        setError(err instanceof Error && err.message ? err.message : "تعذّر التحميل");
      } finally {
        if (request === requestId.current) setLoading(false);
      }
    },
    [resource, sig],
  );

  useEffect(() => {
    if (enabled) load(1);
    return () => { requestId.current++; };
  }, [enabled, load]);

  return { items, loading, error, pagination, load };
}
