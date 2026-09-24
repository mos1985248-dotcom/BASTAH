// hooks/useProductPurchase.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "@/app/providers";
import { useAddressBook } from "@/hooks/useAddressBook";
import { ProductDetail } from "@/components/product/types";

export function useProductPurchase(product: ProductDetail | null, id: string) {
  const { user, loading: userLoading } = useCurrentUser();

  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ items: { product: { id: string } }[] }>("/api/wishlist")
      .then((d) => setIsFavorite(d.items.some((i) => i.product.id === id)))
      .catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      const firstInStock = product.variants.find((v) => v.quantity > 0) ?? product.variants[0];
      setSelectedVariantId(firstInStock.id);
    }
  }, [product]);

  const toggleFavorite = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/products/${id}`;
      return;
    }
    if (isFavorite) {
      setIsFavorite(false);
      await api.delete(`/api/wishlist/${id}`).catch(() => setIsFavorite(true));
    } else {
      setIsFavorite(true);
      await api.post("/api/wishlist", { productId: id }).catch(() => setIsFavorite(false));
    }
  };

  const {
    addresses, selectedAddressId, setSelectedAddressId,
    showAddressForm, setShowAddressForm, addrForm, setAddrForm, handleAddAddress,
  } = useAddressBook(!!user);

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId]
  );
  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;
  const maxQty = product?.variants.length ? selectedVariant?.quantity ?? 0 : product?.quantity ?? 0;

  useEffect(() => {
    // إعادة ضبط الكمية عند تغيير المتغيّر حتى لا تتجاوز مخزونه
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, maxQty)));
  }, [selectedVariantId, maxQty]);

  // ✅ السلة والدفع يستقبلان variantId فعلياً الآن (CartItem وcheckoutSchema
  // مُحدَّثان) — سعر/مخزون الـvariant المختار بصفحة المنتج هو نفسه الذي
  // يُحتسب بالطلب والدفع الفعلي، لا فرق بينهما.
  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/products/${id}`;
      return;
    }
    if (product && product.variants.length > 0 && !selectedVariant) {
      setCheckoutError("اختاري الخيار المطلوب أولاً");
      return;
    }
    setAddingToCart(true);
    try {
      await api.post("/api/cart", { productId: id, quantity: qty, variantId: selectedVariant?.id });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : "تعذّرت إضافة المنتج للسلة");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!user) {
      window.location.href = `/login?redirect=/products/${id}`;
      return;
    }
    if (product && product.variants.length > 0 && !selectedVariant) {
      setCheckoutError("اختاري الخيار المطلوب أولاً");
      return;
    }
    if (!selectedAddressId) {
      setCheckoutError("اختاري عنوان شحن أولاً");
      return;
    }
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const result = await api.post<{ orderId: string; orderNumber: string; paymentUrl: string | null }>("/api/checkout", {
        storeId: product.store.id,
        items: [{ productId: product.id, variantId: selectedVariant?.id, quantity: qty }],
        addressId: selectedAddressId,
        paymentMethod: "CREDIT_CARD",
      });
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl; // توجيه لصفحة دفع Moyasar الحقيقية
      } else {
        window.location.href = `/orders/${result.orderId}`;
      }
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : "تعذّر إتمام الطلب");
    } finally {
      setCheckingOut(false);
    }
  };

  return {
    user, userLoading,
    qty, setQty, selectedVariantId, setSelectedVariantId, selectedVariant, effectivePrice, maxQty,
    isFavorite, toggleFavorite,
    addresses, selectedAddressId, setSelectedAddressId, showAddressForm, setShowAddressForm, addrForm, setAddrForm, handleAddAddress,
    checkingOut, checkoutError, addingToCart, addedToCart,
    handleAddToCart, handleBuyNow,
  };
}
