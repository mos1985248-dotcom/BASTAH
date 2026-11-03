// components/layout/NavIconLinks.tsx
"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { api } from "@/lib/api-client";
import s from "./navctl.module.css";

export default function NavIconLinks({ userId }: { userId: string | undefined }) {
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCartCount(0);
      setFavCount(0);
      return;
    }
    api
      .get<{ items: unknown[] }>("/api/cart")
      .then((d) => setCartCount(d.items.length))
      .catch(() => {});
    api
      .get<{ items: unknown[] }>("/api/wishlist")
      .then((d) => setFavCount(d.items.length))
      .catch(() => {});
  }, [userId]);

  return (
    <div className={s.iconRow}>
      <a
        href="/cart"
        className={`${s.icon} basita-nav-icon`}
        aria-label={cartCount > 0 ? `سلة التسوق، ${cartCount} عناصر` : "سلة التسوق"}
      >
        <ShoppingCart size={20} strokeWidth={1.8} />
        {cartCount > 0 && <CountBadge count={cartCount} />}
      </a>
      <a
        href="/favorites"
        className={`${s.icon} basita-nav-icon basita-fav-icon`}
        aria-label={favCount > 0 ? `المفضلة، ${favCount} عناصر` : "المفضلة"}
      >
        <Heart size={20} strokeWidth={1.8} fill={favCount > 0 ? "currentColor" : "none"} />
        {favCount > 0 && <CountBadge count={favCount} />}
      </a>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return <span className={s.count}>{count > 9 ? "9+" : count}</span>;
}
