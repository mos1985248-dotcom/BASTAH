// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ShoppingCart, AlertTriangle, Info, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { useAddressBook } from "@/hooks/useAddressBook";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import CartStoreGroup from "@/components/cart/CartStoreGroup";
import CartTrustBar from "@/components/cart/CartTrustBar";
import CartRelatedProducts from "@/components/cart/CartRelatedProducts";
import { CartItemData } from "@/components/cart/types";

export default function CartPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { selectedAddressId } = useAddressBook(!!user); // نستخدمها بصمت لمعاينة الشحن/الضريبة فقط — لا نموذج عنوان هنا

  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    api.get<{ items: CartItemData[] }>("/api/cart").then((d) => setItems(d.items)).catch(() => setError(true)).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ items: { product: { id: string } }[] }>("/api/wishlist")
      .then((d) => setFavoriteIds(new Set(d.items.map((i) => i.product.id))))
      .catch(() => {});
  }, [user]);

  const updateQty = async (productId: string, variantId: string | null, qty: number) => {
    const item = items.find((i) => i.product.id === productId && i.variantId === variantId);
    if (!item) return;
    setBusyId(item.id);
    setItems((p) => p.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i)));
    try {
      await api.patch(`/api/cart/${productId}`, { quantity: qty, variantId: variantId ?? undefined });
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (productId: string, variantId: string | null) => {
    const item = items.find((i) => i.product.id === productId && i.variantId === variantId);
    if (!item) return;
    setBusyId(item.id);
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== item.id));
    try {
      const qs = variantId ? `?variantId=${variantId}` : "";
      await api.delete(`/api/cart/${productId}${qs}`);
    } catch {
      setItems(prev);
    } finally {
      setBusyId(null);
    }
  };

  const toggleFavorite = async (productId: string) => {
    const isFav = favoriteIds.has(productId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      if (isFav) await api.delete(`/api/wishlist/${productId}`);
      else await api.post("/api/wishlist", { productId });
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(productId) : next.delete(productId);
        return next;
      });
    }
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
          <ShoppingBag size={40} strokeWidth={1.5} color={t.colors.text.light} style={{ margin: "0 auto" }} />
          <p style={{ color: t.colors.text.mid, margin: `${t.spacing["3"]} 0` }}>سجّلي دخولك لعرض سلة التسوق</p>
          <a href="/login?redirect=/cart" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
            تسجيل الدخول
            <ArrowLeft size={15} strokeWidth={2} />
          </a>
        </div>
      </SiteShell>
    );
  }

  const groups = items.reduce<Record<string, { storeName: string; items: CartItemData[] }>>((acc, item) => {
    const sid = item.product.store.id;
    if (!acc[sid]) acc[sid] = { storeName: item.product.store.nameAr, items: [] };
    acc[sid].items.push(item);
    return acc;
  }, {});
  const storeIds = Object.keys(groups);
  const grandTotal = items.reduce((s, i) => s + (i.variant?.price ?? i.product.price) * i.quantity, 0);

  return (
    <SiteShell>
      <div className="basita-cart-container" style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["5"]} ${t.spacing["5"]} ${t.spacing["16"]}` }}>
        <nav style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, marginBottom: t.spacing["2"] }}>
          <a href="/" style={{ color: t.colors.text.light, textDecoration: "none" }}>الرئيسية</a> ‹ السلة
        </nav>
        <h1 style={{ fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], margin: `0 0 ${t.spacing["5"]}`, display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingCart size={22} strokeWidth={1.8} />
          سلة مشترياتك
        </h1>

        {loading && <p style={{ color: t.colors.text.mid }}>جاري التحميل...</p>}
        {error && !loading && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            حدث خطأ، حاولي تحديث الصفحة
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: "center", padding: `${t.spacing["16"]} ${t.spacing["4"]}`, background: t.colors.white, borderRadius: t.radius.xl }}>
            <ShoppingCart size={48} strokeWidth={1.5} color={t.colors.text.light} style={{ margin: "0 auto" }} />
            <p style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, margin: `${t.spacing["4"]} 0 ${t.spacing["1"]}` }}>سلتك فارغة</p>
            <p style={{ color: t.colors.text.mid, margin: `0 0 ${t.spacing["5"]}` }}>لسه ما أضفتِ أي منتج — تصفّحي الأسر المنتجة واكتشفي منتجاتهم</p>
            <a
              href="/marketplace"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: t.colors.primary[800], color: t.colors.white, borderRadius: t.radius.full, textDecoration: "none", fontWeight: t.typography.fontWeight.bold }}
            >
              <ShoppingBag size={16} strokeWidth={1.8} />
              تصفّحي المنتجات
            </a>
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            {storeIds.length > 1 && (
              <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, marginBottom: t.spacing["4"], background: t.colors.cream.warm, padding: t.spacing["3"], borderRadius: t.radius.md }}>
                <Info size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                سلتك تحتوي منتجات من {storeIds.length} متاجر — لكل متجر عملية دفع منفصلة. إجمالي السلة كاملة: <strong style={{ color: t.colors.text.dark }}>{grandTotal} ر.س</strong>
              </p>
            )}

            {Object.entries(groups).map(([storeId, g]) => (
              <CartStoreGroup
                key={storeId}
                storeId={storeId}
                storeName={g.storeName}
                items={g.items}
                busyId={busyId}
                favoriteIds={favoriteIds}
                addressId={selectedAddressId}
                onQtyChange={updateQty}
                onRemove={removeItem}
                onToggleFavorite={toggleFavorite}
              />
            ))}

            <CartTrustBar />
            <CartRelatedProducts excludeProductIds={items.map((i) => i.product.id)} />
          </>
        )}
      </div>

      {/* شريط سفلي ثابت بالجوال — فقط لو متجر واحد بالسلة (تفادياً لغموض "أي متجر؟") */}
      {!loading && storeIds.length === 1 && (
        <div className="basita-cart-sticky" style={{ display: "none", position: "fixed", bottom: 0, insetInline: 0, background: t.colors.white, borderTop: `1px solid ${t.colors.cream.border}`, padding: t.spacing["3"], zIndex: 50, boxShadow: t.shadows.lg }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: t.spacing["3"] }}>
            <div>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>الإجمالي</p>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>{grandTotal} ر.س</p>
            </div>
            <a
              href={`/checkout?store=${storeIds[0]}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flex: 1, maxWidth: 220, textAlign: "center", padding: 13, background: t.colors.primary[800], color: t.colors.white, borderRadius: t.radius.lg, textDecoration: "none", fontWeight: t.typography.fontWeight.bold }}
            >
              إتمام الطلب
              <ArrowLeft size={15} strokeWidth={2} />
            </a>
          </div>
        </div>
      )}

      <style>{`
        html, body { overflow-x: hidden; }
        @media (max-width: 700px) {
          .basita-cart-sticky { display: block !important; }
          .basita-cart-container { padding-bottom: 100px !important; }
        }
      `}</style>
    </SiteShell>
  );
}
