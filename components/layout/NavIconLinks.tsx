// components/layout/NavIconLinks.tsx
"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { t } from "@/theme";
import { api } from "@/lib/api-client";

export default function NavIconLinks({ userId }: { userId: string | undefined }) {
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCartCount(0);
      setFavCount(0);
      return;
    }
    api.get<{ items: unknown[] }>("/api/cart").then((d) => setCartCount(d.items.length)).catch(() => {});
    api.get<{ items: unknown[] }>("/api/wishlist").then((d) => setFavCount(d.items.length)).catch(() => {});
  }, [userId]);

  const iconStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: t.colors.text.body,
    textDecoration: "none",
    fontSize: t.typography.fontSize.base,
    padding: `6px ${t.spacing["2"]}`,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: t.spacing["3"] }}>
      <a href="/cart" style={iconStyle} aria-label="سلة التسوق" className="basita-nav-icon">
        <ShoppingCart size={22} strokeWidth={1.8} />
        {cartCount > 0 && <CountBadge count={cartCount} />}
      </a>
      <a href="/favorites" style={iconStyle} aria-label="المفضلة" className="basita-nav-icon">
        <Heart size={22} strokeWidth={1.8} />
        {favCount > 0 && <CountBadge count={favCount} />}
      </a>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        position: "absolute",
        top: 0,
        insetInlineEnd: 0,
        minWidth: 18,
        height: 18,
        borderRadius: t.radius.full,
        background: t.colors.semantic.danger,
        color: t.colors.white,
        fontSize: t.typography.fontSize.xs,
        fontWeight: t.typography.fontWeight.bold,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}