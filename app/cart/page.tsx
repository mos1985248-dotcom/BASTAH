// app/cart/page.tsx
// المنطق (الجلب والكمية والحذف والمفضلة والتجميع حسب المتجر) كما كان حرفياً؛ التغيير في العرض فقط.
"use client";

import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, Info, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import { useAddressBook } from "@/hooks/useAddressBook";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SiteShell from "@/components/layout/SiteShell";
import CartContactConsent from "@/components/cart/CartContactConsent";
import CartStoreGroup from "@/components/cart/CartStoreGroup";
import CartTrustBar from "@/components/cart/CartTrustBar";
import CartRelatedProducts from "@/components/cart/CartRelatedProducts";
import { CartEmpty, CartError, CartLoading, CartLoginPrompt } from "@/components/cart/CartStates";
import { CartItemData } from "@/components/cart/types";
import c from "@/components/cart/cart.module.css";

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

  const shell = (children: React.ReactNode) => (
    <SiteShell>
      <div style={{ background: t.colors.heritage.sand }}>
        <main className={c.page} style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}>
          {children}
        </main>
      </div>
    </SiteShell>
  );

  if (userLoading) return shell(<CartLoading />);
  if (!user) return shell(<CartLoginPrompt />);

  const groups = items.reduce<Record<string, { storeName: string; storeSlug: string; items: CartItemData[] }>>((acc, item) => {
    const sid = item.product.store.id;
    if (!acc[sid]) acc[sid] = { storeName: item.product.store.nameAr, storeSlug: item.product.store.slug, items: [] };
    acc[sid].items.push(item);
    return acc;
  }, {});
  const storeIds = Object.keys(groups);
  // نفس شرط CartStoreGroup: منتج غير نشط أو نفدت كميته يمنع المتابعة (الشريط الثابت كان لا يلتزم به)
  const hasIssue = items.some(
    (i) =>
      i.product.status !== "ACTIVE" ||
      (i.variant ? i.variant.quantity === 0 : i.product.quantity === 0),
  );
  const grandTotal = items.reduce((s, i) => s + (i.variant?.price ?? i.product.price) * i.quantity, 0);

  return (
    <SiteShell>
      <div style={{ background: t.colors.heritage.sand }}>
        <main className={c.page} style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}>
          <nav className={c.crumbs} aria-label="مسار التصفح">
            <a href="/">الرئيسية</a> ‹ السلة
          </nav>
          <h1 className={c.title} style={{ fontFamily: t.typography.fontFamily.display }}>
            <ShoppingCart size={26} strokeWidth={1.7} aria-hidden="true" />
            سلة مشترياتك
          </h1>

          {loading && <CartLoading />}
          {error && !loading && <CartError />}
          {!loading && !error && items.length === 0 && <CartEmpty />}

          {!loading && items.length > 0 && (
            <>
              {storeIds.length > 1 && (
                <p className={c.notice}>
                  <Info size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>
                    سلتك تحتوي منتجات من {storeIds.length} متاجر — لكل متجر عملية دفع منفصلة. إجمالي السلة كاملة: <strong>{grandTotal} ر.س</strong>
                  </span>
                </p>
              )}
              {Object.entries(groups).map(([storeId, g]) => (
                <Fragment key={storeId}>
                  <CartStoreGroup
                    storeId={storeId}
                    storeName={g.storeName}
                    storeSlug={g.storeSlug}
                    items={g.items}
                    busyId={busyId}
                    favoriteIds={favoriteIds}
                    addressId={selectedAddressId}
                    onQtyChange={updateQty}
                    onRemove={removeItem}
                    onToggleFavorite={toggleFavorite}
                  />
                  <CartContactConsent storeId={storeId} storeName={g.storeName} />
                </Fragment>
              ))}
              <CartTrustBar />
              <CartRelatedProducts excludeProductIds={items.map((i) => i.product.id)} />
            </>
          )}
        </main>
      </div>

      {/* شريط سفلي ثابت بالجوال — فقط لو متجر واحد بالسلة (تفادياً لغموض "أي متجر؟") */}
      {!loading && storeIds.length === 1 && (
        <div className={c.sticky} style={uiVars}>
          <div>
            <p className={c.stickyLabel}>الإجمالي</p>
            <p className={c.stickyTotal}>{grandTotal} ر.س</p>
          </div>
          <a
            href={hasIssue ? undefined : `/checkout?store=${storeIds[0]}`}
            aria-disabled={hasIssue}
            className={c.stickyBtn}
          >
            إتمام الطلب
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      )}
    </SiteShell>
  );
}
