// components/marketplace/MarketplaceHero.tsx
import { t } from "@/theme";
import SearchBar from "@/components/layout/SearchBar";

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
    <div
      style={{
        background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`,
        padding: `${t.spacing["10"]} ${t.spacing["4"]}`,
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <h1
          style={{
            color: t.colors.text.onDark,
            fontSize: t.typography.fontSize["2xl"],
            fontWeight: t.typography.fontWeight.bold,
            margin: `0 0 ${t.spacing["5"]}`,
          }}
        >
          تسوّقي من بيوت سعودية
        </h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onSubmit={onSubmit}
            placeholder="ابحثي عن منتج أو متجر..."
            variant="onDark"
          />
        </div>
      </div>
    </div>
  );
}
