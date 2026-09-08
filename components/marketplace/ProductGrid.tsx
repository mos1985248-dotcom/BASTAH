// components/marketplace/ProductGrid.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import ProductCard, { MarketplaceProduct } from "./ProductCard";

export default function ProductGrid({
  products,
  loading,
  error,
}: {
  products: MarketplaceProduct[];
  loading: boolean;
  error: string;
}) {
  if (loading) {
    return <p style={{ textAlign: "center", color: t.colors.text.mid, padding: t.spacing["10"] }}>جاري التحميل...</p>;
  }
  if (error) {
    return (
      <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", color: t.colors.semantic.danger, padding: t.spacing["10"] }}>
        <AlertTriangle size={16} strokeWidth={1.8} />
        {error}
      </p>
    );
  }
  if (products.length === 0) {
    return <p style={{ textAlign: "center", color: t.colors.text.mid, padding: t.spacing["10"] }}>لا توجد منتجات حالياً</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: t.spacing["4"],
      }}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
