// components/marketplace/MarketplaceClient.tsx
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import MarketplaceHero from "@/components/marketplace/MarketplaceHero";
import SortBar from "@/components/marketplace/SortBar";
import ProductGrid from "@/components/marketplace/ProductGrid";
import Pagination from "@/components/marketplace/Pagination";
import CategoryNav from "@/components/home/CategoryNav";
import { MarketplaceProduct } from "@/components/marketplace/ProductCard";

export default function MarketplaceClient() {
  return (
    <Suspense fallback={null}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState("popular");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        page: String(page),
        sort,
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
      });
      const data = await api.get<{ products: MarketplaceProduct[]; pagination: typeof pagination }>(
        `/api/products?${qs.toString()}`
      );
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message ?? "تعذّر تحميل المنتجات");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search, category]);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <SiteShell>
      <MarketplaceHero search={search} onSearchChange={setSearch} onSubmit={() => load(1)} />

      <div id="categories">
        <CategoryNav />
      </div>

      <div style={{ maxWidth: t.layout.containerMaxWidth, margin: "0 auto", padding: t.spacing["6"] }}>
        {category && (
          <button
            onClick={() => setCategory("")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: t.spacing["3"],
              padding: "6px 14px",
              borderRadius: t.radius.full,
              border: `1px solid ${t.colors.primary[800]}`,
              background: t.colors.primary[100],
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.xs,
              cursor: "pointer",
            }}
          >
            الفئة: {category}
            <X size={12} strokeWidth={2.2} />
          </button>
        )}
        <SortBar total={pagination.total} sort={sort} onSortChange={setSort} />
        <ProductGrid products={products} loading={loading} error={error} />
        <Pagination page={pagination.page} pages={pagination.pages} onChange={load} />
      </div>
    </SiteShell>
  );
}