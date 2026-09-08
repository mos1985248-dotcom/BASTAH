// app/favorites/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import { MarketplaceProduct } from "@/components/marketplace/ProductCard";

interface WishlistItem {
  id: string;
  product: MarketplaceProduct;
}

export default function FavoritesPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get<{ items: WishlistItem[] }>("/api/wishlist").then((d) => setItems(d.items)).catch(() => setError(true)).finally(() => setLoading(false));
  }, [user]);

  const remove = async (productId: string) => {
    setItems((p) => p.filter((i) => i.product.id !== productId));
    await api.delete(`/api/wishlist/${productId}`).catch(() => {});
  };

  if (userLoading) {
    return (
      <SiteShell>
        <p style={{ textAlign: "center", padding: t.spacing["16"], color: t.colors.text.mid }}>جاري التحميل...</p>
      </SiteShell>
    );
  }
  if (!user) {
    return (
      <SiteShell>
        <div style={{ textAlign: "center", padding: t.spacing["16"] }}>
          <p style={{ color: t.colors.text.mid, marginBottom: t.spacing["3"] }}>سجّلي دخولك لعرض مفضّلتك</p>
          <a href="/login?redirect=/favorites" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
            تسجيل الدخول
            <ArrowLeft size={15} strokeWidth={2} />
          </a>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["5"] }}>
          مفضّلتي
        </h1>

        {loading && <p style={{ color: t.colors.text.mid }}>جاري التحميل...</p>}
        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            تعذّر تحميل المفضلة، حاولي تحديث الصفحة
          </p>
        )}
        {!loading && !error && items.length === 0 && <p style={{ color: t.colors.text.mid }}>لا توجد منتجات بالمفضلة بعد</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: t.spacing["4"] }}>
          {items.map((i) => (
            <div key={i.id} style={{ position: "relative" }}>
              <a href={`/products/${i.product.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: t.colors.white, borderRadius: t.radius.lg, overflow: "hidden", border: `1px solid ${t.colors.cream.border}` }}>
                  <div style={{ height: 140, background: i.product.mainImage ? `url(${i.product.mainImage}) center/cover` : t.colors.gold[100] }} />
                  <div style={{ padding: t.spacing["3"] }}>
                    <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{i.product.nameAr}</p>
                    <p style={{ margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{i.product.price} ر.س</p>
                  </div>
                </div>
              </a>
              <button
                onClick={() => remove(i.product.id)}
                aria-label="حذف من المفضلة"
                style={{ position: "absolute", top: 8, insetInlineEnd: 8, width: 28, height: 28, borderRadius: t.radius.full, border: "none", background: t.colors.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={14} strokeWidth={2} color={t.colors.text.body} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
