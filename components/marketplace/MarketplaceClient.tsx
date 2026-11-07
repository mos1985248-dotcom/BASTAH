// components/marketplace/MarketplaceClient.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SiteShell from "@/components/layout/SiteShell";
import type { HomeStore } from "@/components/home/StoreCard";
import MarketplaceHero from "./MarketplaceHero";
import MarketControls, { type MarketView } from "./MarketControls";
import SortBar from "./SortBar";
import ProductGrid from "./ProductGrid";
import StoreGrid from "./StoreGrid";
import Pagination from "./Pagination";
import type { MarketplaceProduct } from "./ProductCard";
import { useMarketData } from "./useMarketData";
import s from "./market.module.css";

export default function MarketplaceClient() {
  return (
    <Suspense fallback={null}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<MarketView>(searchParams.get("view") === "stores" ? "stores" : "products");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [term, setTerm] = useState(search); // البحث المعتمد: بعد توقّف الكتابة أو عند الإرسال
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    const id = setTimeout(() => setTerm(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  const filters = { ...(term ? { search: term } : {}), ...(category ? { category } : {}) };
  const products = useMarketData<MarketplaceProduct>("products", { sort, ...filters }, view === "products");
  const stores = useMarketData<HomeStore>("stores", { limit: "12", ...filters }, view === "stores");
  const active = view === "products" ? products : stores;

  return (
    <SiteShell>
      <div style={{ background: t.colors.heritage.sand }}>
        <MarketplaceHero search={search} onSearchChange={setSearch} onSubmit={() => setTerm(search)} />

        <div className={s.page} style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}>
          <MarketControls view={view} onViewChange={setView} category={category} onCategoryChange={setCategory} />

          {view === "products" ? (
            <>
              <SortBar total={products.pagination.total} unit="منتج" sort={sort} onSortChange={setSort} />
              <ProductGrid products={products.items} loading={products.loading} error={products.error} onRetry={() => products.load(1)} />
            </>
          ) : (
            <section id="stores" aria-labelledby="market-stores-heading" className={s.storesSection}>
              <h2 id="market-stores-heading" className={s.storesTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
                ممشى البسطات
              </h2>
              <SortBar total={stores.pagination.total} unit="متجر" />
              <StoreGrid stores={stores.items} loading={stores.loading} error={stores.error} onRetry={() => stores.load(1)} />
            </section>
          )}

          <Pagination page={active.pagination.page} pages={active.pagination.pages} onChange={active.load} />
        </div>
      </div>
    </SiteShell>
  );
}
