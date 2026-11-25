"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";

type Quote = { couponCode: string; discountAmount: number };
type Item = { productId: string; variantId?: string; quantity: number };

export function useCheckoutCoupon(storeId: string | null, items: Item[], available: boolean) {
  const key = storeId ? `bastah-coupon:${storeId}` : "";
  const cart = JSON.stringify(items);
  const request = useRef(0);
  const [result, setResult] = useState<{ key: string; cart: string; quote: Quote } | null>(null);
  const [savedCode, setSavedCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const apply = useCallback(async (code: string) => {
    if (!key || !available || cart === "[]") return;
    const id = ++request.current;
    setBusy(true);
    setError("");
    try {
      const quote = await api.post<Quote>("/api/checkout/preview", {
        storeId, items: JSON.parse(cart), couponCode: code, couponOnly: true,
      });
      if (request.current !== id) return;
      sessionStorage.setItem(key, quote.couponCode);
      setSavedCode(quote.couponCode);
      setResult({ key, cart, quote });
    } catch (err) {
      if (request.current !== id) return;
      setError(err instanceof Error ? err.message : "تعذّر تطبيق الكوبون.");
    } finally {
      if (request.current === id) setBusy(false);
    }
  }, [key, available, cart, storeId]);

  const clear = useCallback(() => {
    request.current++;
    if (key) sessionStorage.removeItem(key);
    setResult(null);
    setSavedCode("");
    setBusy(false);
    setError("");
  }, [key]);

  useEffect(() => {
    setBusy(false);
    if (key && cart !== "[]") {
      const saved = sessionStorage.getItem(key);
      setSavedCode(saved ?? "");
      if (saved && available) void apply(saved);
      else if (saved) setError("كوبونات الخصم غير متاحة لهذا المتجر حاليًا.");
    }
    return () => { request.current++; };
  }, [key, available, cart, apply]);

  return {
    quote: available && result?.key === key && result.cart === cart ? result.quote : null,
    savedCode, available, busy, error, apply, clear,
  };
}
