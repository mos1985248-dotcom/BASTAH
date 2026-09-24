// app/dashboard/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import ProductStatusBadge from "@/components/dashboard/ProductStatusBadge";

interface ProductRow {
  id: string; nameAr: string; mainImage: string | null; price: number;
  quantity: number; status: string; totalSold: number;
  variants: { id: string; nameAr: string; quantity: number }[];
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ products: ProductRow[] }>("/api/products?view=seller")
      .then(({ products }) => setProducts(products))
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل المنتجات"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div
        style={{
          background: t.colors.white,
          borderBottom: `1px solid ${t.colors.cream.border}`,
          padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: t.typography.fontSize.xl, color: t.colors.text.dark }}>منتجاتي</h1>
        <a
          href="/dashboard/products/new"
          style={{ padding: "8px 16px", background: t.colors.primary[800], color: t.colors.text.onDark, borderRadius: t.radius.md, textDecoration: "none", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}
        >
          + إضافة منتج
        </a>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: t.spacing["5"] }}>
        {loading && <p style={{ color: t.colors.text.mid }}>جاري التحميل...</p>}
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            {error}
          </p>
        )}
        {!loading && products.length === 0 && <p style={{ color: t.colors.text.mid }}>لا توجد منتجات بعد — أضيفي أول منتج لك</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {products.map((p) => (
            <a key={p.id} href={`/dashboard/products/${p.id}/edit`} style={{ textDecoration: "none" }}>
              <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["3"], display: "flex", gap: t.spacing["3"], alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: t.radius.md,
                    flexShrink: 0,
                    background: p.mainImage ? `url(${p.mainImage}) center/cover` : `linear-gradient(135deg, ${t.colors.gold[700]}, ${t.colors.gold[600]})`,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 3px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{p.nameAr}</p>
                  <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
                    {p.price} ر.س · {p.variants.length > 0 ? `الكمية الكلية: ${p.quantity}` : `الكمية: ${p.quantity}`}
                  </p>
                  {p.variants.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                      {p.variants.map((v) => (
                        <span
                          key={v.id}
                          style={{
                            padding: "2px 8px", borderRadius: t.radius.full, fontSize: 11,
                            background: v.quantity > 0 ? t.colors.cream.bg : t.colors.semantic.dangerBg,
                            color: v.quantity > 0 ? t.colors.text.mid : t.colors.semantic.danger,
                          }}
                        >
                          {v.nameAr}: {v.quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ProductStatusBadge status={p.status} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
