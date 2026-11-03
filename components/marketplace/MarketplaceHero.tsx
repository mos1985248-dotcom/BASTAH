// components/marketplace/MarketplaceHero.tsx
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SearchBar from "@/components/layout/SearchBar";
import s from "./market.module.css";

export default function MarketplaceHero({
  search,
  onSearchChange,
  onSubmit,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section className={s.heroWrap} style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}>
      <div className={s.hero}>
        <p className={s.heroKicker}>سوق بسطة</p>
        <h1 className={s.heroTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
          تسوّق من بيوت سعودية
        </h1>
        <p className={s.heroSub}>منتجات وحرف يدوية من الأسر السعودية المنتجة</p>
        <div className={s.heroSearch}>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onSubmit={onSubmit}
            placeholder="ابحث عن منتج أو متجر..."
            variant="onDark"
          />
        </div>
      </div>
    </section>
  );
}
