// components/marketplace/MarketControls.tsx
// تبويب «المنتجات | البسطات» + فلتر الأقسام (الوجهة الفعلية لرابط /marketplace#categories).
import { CATEGORY_LABELS } from "@/components/home/categories-data";
import s from "./market.module.css";

export type MarketView = "products" | "stores";

export default function MarketControls({
  view,
  onViewChange,
  category,
  onCategoryChange,
  city, cities, citiesError, onCityChange,
}: {
  view: MarketView;
  onViewChange: (v: MarketView) => void;
  category: string;
  onCategoryChange: (slug: string) => void;
  city: string;
  cities: string[];
  citiesError: boolean;
  onCityChange: (city: string) => void;
}) {
  const tabs: { id: MarketView; label: string }[] = [
    { id: "products", label: "المنتجات" },
    { id: "stores", label: "البسطات" },
  ];
  return (
    <div className={s.controls} id="categories">
      <div className={s.tabs} role="tablist" aria-label="عرض السوق">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={view === tab.id}
            className={`${s.tab} ${view === tab.id ? s.tabOn : ""}`}
            onClick={() => onViewChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={s.cityFilter}>
        <label htmlFor="market-city">المدينة</label>
        <select id="market-city" className={s.select} value={city} onChange={e => onCityChange(e.target.value)}>
          <option value="">كل المدن</option>
          {[...new Set([...cities, ...(city ? [city] : [])])].map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        {citiesError && <span role="status">تعذّر تحميل المدن</span>}
        {(city || category) && <button type="button" className={s.resetFilters} onClick={() => { onCityChange(""); onCategoryChange(""); }}>مسح التصفيات</button>}
      </div>
      <div className={s.chips} role="group" aria-label="الأقسام">
        {[["", "الكل"], ...Object.entries(CATEGORY_LABELS)].map(([slug, label]) => (
          <button
            key={slug || "all"}
            type="button"
            aria-pressed={category === slug}
            className={`${s.chip} ${category === slug ? s.chipOn : ""}`}
            onClick={() => onCategoryChange(slug)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
