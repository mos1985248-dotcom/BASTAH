"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { api, ApiError } from "./api-client";

const key = "bastah:guest-cart";
const changed = "bastah:guest-cart-changed";
const lineSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().min(1).max(99),
  storeId: z.string().cuid(),
  storeName: z.string(),
  name: z.string(),
  maxQuantity: z.number().int().positive(),
});
export type GuestCartLine = z.infer<typeof lineSchema>;
export const guestCartEnabled = process.env.NEXT_PUBLIC_GUEST_CHECKOUT_ENABLED === "true";

export function lineKey(line: Pick<GuestCartLine, "productId" | "variantId">) {
  return `${line.productId}:${line.variantId ?? ""}`;
}

export function readGuestCart(): GuestCartLine[] {
  try {
    const items = z.array(lineSchema).max(50).safeParse(JSON.parse(localStorage.getItem(key) ?? "[]"));
    return items.success ? items.data : [];
  } catch { return []; }
}

function writeGuestCart(lines: GuestCartLine[]) {
  localStorage.setItem(key, JSON.stringify(lines));
  window.dispatchEvent(new Event(changed));
}

export function addGuestCartLine(line: GuestCartLine) {
  const lines = readGuestCart();
  const existing = lines.find((item) => lineKey(item) === lineKey(line));
  if (!existing && lines.length >= 50) throw new Error("السلة ممتلئة");
  const quantity = Math.min((existing?.quantity ?? 0) + line.quantity, line.maxQuantity, 99);
  const next = { ...line, quantity };
  writeGuestCart(existing ? lines.map((item) => lineKey(item) === lineKey(line) ? next : item) : [...lines, next]);
}

export function updateGuestCartLine(line: GuestCartLine, quantity: number) {
  const lines = readGuestCart();
  writeGuestCart(quantity === 0
    ? lines.filter((item) => lineKey(item) !== lineKey(line))
    : lines.map((item) => lineKey(item) === lineKey(line)
      ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity, 99)) } : item));
}

export function removePurchasedGuestLines(snapshot: Pick<GuestCartLine, "productId" | "variantId" | "quantity">[]) {
  const purchased = new Map(snapshot.map((item) => [lineKey(item), item.quantity]));
  writeGuestCart(readGuestCart().flatMap((item) => {
    const quantity = item.quantity - (purchased.get(lineKey(item)) ?? 0);
    return quantity > 0 ? [{ ...item, quantity }] : [];
  }));
}

export function useGuestCart() {
  const [lines, setLines] = useState<GuestCartLine[]>([]);
  useEffect(() => {
    if (!guestCartEnabled) return;
    const refresh = () => setLines(readGuestCart());
    const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) refresh(); };
    refresh();
    window.addEventListener(changed, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(changed, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return lines;
}

export async function mergeGuestCart(userId: string) {
  if (!guestCartEnabled) return;
  const snapshot = readGuestCart().map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity }));
  if (!snapshot.length) return;
  const merge = () => api.post<{ imported: typeof snapshot }>("/api/cart/guest-merge", { userId, items: snapshot });
  const result = await merge().catch((error) => {
    if (error instanceof ApiError && error.status === 409) return merge();
    throw error;
  });
  removePurchasedGuestLines(result.imported);
}
