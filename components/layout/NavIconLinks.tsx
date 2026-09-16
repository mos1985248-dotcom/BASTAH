// components/layout/NavIconLinks.tsx
"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { t } from "@/theme";
import { api } from "@/lib/api-client";

export default function NavIconLinks({
  userId,
}: {
  userId: string | undefined;
}) {
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

  const iconStyle: React.CSSProperties = {
    position: "relative",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    background: "#FFFDF8",
    border: "1px solid rgba(91,70,45,0.11)",
    color: t.colors.primary[800],
    textDecoration: "none",
    boxSizing: "border-box",
    transition:
      `background ${t.motion.fast} ${t.motion.ease}, ` +
      `border-color ${t.motion.fast} ${t.motion.ease}, ` +
      `transform ${t.motion.fast} ${t.motion.ease}, ` +
      `box-shadow ${t.motion.fast} ${t.motion.ease}`,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      <a
        href="/cart"
        style={iconStyle}
        aria-label={
          cartCount > 0 ? `سلة التسوق، ${cartCount} عناصر` : "سلة التسوق"
        }
        className="basita-nav-icon"
      >
        <ShoppingCart size={19} strokeWidth={1.8} />

        {cartCount > 0 && <CountBadge count={cartCount} />}
      </a>

      <a
        href="/favorites"
        style={iconStyle}
        aria-label={
          favCount > 0 ? `المفضلة، ${favCount} عناصر` : "المفضلة"
        }
        className="basita-nav-icon"
      >
        <Heart
          size={19}
          strokeWidth={1.8}
          fill={favCount > 0 ? "rgba(166,124,45,0.12)" : "none"}
        />

        {favCount > 0 && <CountBadge count={favCount} />}
      </a>

      <style>{`
        .basita-nav-icon:hover {
          transform: translateY(-2px);
          background: #F7F1E5 !important;
          border-color: rgba(166,124,45,0.24) !important;
          box-shadow: 0 6px 14px rgba(67,48,29,0.07);
        }
      `}</style>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 17,
        height: 17,
        padding: "0 4px",
        borderRadius: t.radius.full,
        background: t.colors.semantic.danger,
        color: t.colors.white,
        border: "2px solid #FFFDF8",
        fontSize: 10,
        fontWeight: t.typography.fontWeight.bold,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}