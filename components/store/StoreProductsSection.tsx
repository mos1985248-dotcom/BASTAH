// components/store/StoreProductsSection.tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { useFavorites } from "@/hooks/useFavorites";
import type { MarketplaceProduct } from "@/components/marketplace/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import card from "@/components/marketplace/card.module.css";
import StoreProductRow from "./StoreProductRow";
import s from "./sections.module.css";

interface Section {
  id: string;
  name: string;
}

export default function StoreProductsSection({ storeId, sections = [] }: { storeId: string; sections?: Section[] }) {
  const [selection, setSelection] = useState("");
  const { favoriteIds, toggleFavorite } = useFavorites();

  return (
    <section id="products" aria-label="من بسطتنا" className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}>
      <div className={s.head}>
        <h2 className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>من بسطتنا</h2>
      </div>
      {sections.length > 0 ? (
        <>
          <div className={s.sectionFilters} role="group" aria-label="أقسام البسطة">
            {[{ id: "", name: "الكل" }, ...sections].map((section) => (
              <button key={section.id} type="button" className={s.sectionFilter}
                aria-pressed={selection === section.id} onClick={() => setSelection(section.id)}>
                {section.name}
              </button>
            ))}
          </div>
          <SectionProducts key={selection} storeId={storeId} sectionId={selection}
            title={sections.find((section) => section.id === selection)?.name ?? "كل ما في البسطة"}
            favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
        </>
      ) : <FeaturedProducts storeId={storeId} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />}
    </section>
  );
}

interface ProductListProps {
  storeId: string;
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
}

function FeaturedProducts({ storeId, favoriteIds, onToggleFavorite }: ProductListProps) {
  const [bestSellers, setBestSellers] = useState<MarketplaceProduct[]>([]);
  const [newest, setNewest] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<{ products: MarketplaceProduct[] }>(`/api/products?storeId=${storeId}&sort=popular&limit=8`),
      api.get<{ products: MarketplaceProduct[] }>(`/api/products?storeId=${storeId}&sort=newest&limit=8`),
    ])
      .then(([pop, recent]) => {
        if (!active) return;
        setBestSellers(pop.products);
        setNewest(recent.products);
      })
      .catch(() => {
        if (!active) return;
        setBestSellers([]);
        setNewest([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [storeId]);

  const empty = !loading && bestSellers.length === 0 && newest.length === 0;

  return (
    <div aria-busy={loading}>
      {loading && <ProductsSkeleton />}

      {empty && <EmptyState title="لا توجد منتجات معروضة في البسطة بعد" description="تابع البسطة ليصلك جديدها." />}

      {!loading && !empty && (
        <div className={s.rows}>
          <StoreProductRow
            title="الأكثر طلبًا من بسطتنا"
            subtitle="اختيارات زوّار البسطة"
            products={bestSellers}
            rankBadgeFirst="الأكثر مبيعًا"
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
          <StoreProductRow
            title="جديد البسطة"
            subtitle="ما أضفناه حديثًا إلى بسطتنا"
            products={newest}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      )}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className={s.grid} aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={card.skeleton}>
          <Skeleton height={200} radius="0" />
          <div className={card.skeletonBody}>
            <Skeleton height={12} width="45%" />
            <Skeleton height={16} />
            <Skeleton height={18} width="35%" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionProducts({ storeId, sectionId, title, favoriteIds, onToggleFavorite }: ProductListProps & {
  sectionId: string;
  title: string;
}) {
  const [page, setPage] = useState(1);
  const [request, setRequest] = useState(0);
  const [result, setResult] = useState<{ products: MarketplaceProduct[]; pagination: { pages: number } } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ storeId, sort: "newest", page: String(page), limit: "20" });
    if (sectionId) query.set("storeSectionId", sectionId);
    api.get<NonNullable<typeof result>>(`/api/products?${query}`)
      .then((data) => { if (active) setResult(data); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [page, request, sectionId, storeId]);

  function goToPage(next: number) {
    setResult(null);
    setFailed(false);
    setPage(next);
    setRequest((attempt) => attempt + 1);
  }

  const loading = !result && !failed;
  return (
    <div aria-busy={loading}>
      {loading && <ProductsSkeleton />}
      {failed && <div>
        <p role="alert">تعذّر عرض ما في البسطة.</p>
        <button type="button" className={s.sectionFilter} onClick={() => goToPage(page)}>إعادة المحاولة</button>
      </div>}
      {result && (
        <>
          {result.products.length ? <StoreProductRow title={title} products={result.products}
            favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} /> : <EmptyState title="لا توجد منتجات في هذا القسم حاليًا" />}
          {(page > 1 || result.pagination.pages > page) && (
            <div className={s.sectionFilters} role="group" aria-label="صفحات المنتجات">
              <button type="button" className={s.sectionFilter} disabled={page === 1} onClick={() => goToPage(page - 1)}>السابق</button>
              <button type="button" className={s.sectionFilter} disabled={page >= result.pagination.pages} onClick={() => goToPage(page + 1)}>التالي</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
