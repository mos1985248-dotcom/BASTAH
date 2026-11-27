"use client";
import { usePathname } from "next/navigation";
import { uiVars } from "@/components/ui/vars";
import { Home, ShoppingCart, Store, UserRound } from "lucide-react";
import type { useCurrentUser } from "@/app/providers";
import { CountBadge } from "./NavIconLinks";
import { HOME_HREF, STORES_HREF } from "./NavLinks";
import s from "./nav.module.css";

type UserState = Pick<ReturnType<typeof useCurrentUser>, "user" | "loading">;

export default function MobileBottomNav({ user, loading, cartCount }: UserState & { cartCount: number }) {
  const pathname = usePathname();
  const active = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const current = (href: string) => active(href) ? "page" as const : undefined;
  const hasStore = Boolean(user?.store);
  let merchantHref = "/register";
  if (user) {
    merchantHref = "/account";
    if (user.role === "SELLER" && hasStore) merchantHref = "/dashboard";
    if ((user.role === "SELLER" || user.role === "BUYER") && !hasStore) {
      merchantHref = "/dashboard/create-store";
    }
  }

  return (
    <nav aria-label="تنقل الجوال" className={s.bottomNav} style={uiVars}>
      <a href={HOME_HREF} className={s.bottomLink} aria-current={current("/")}>
        <Home size={20} aria-hidden="true" />
        الرئيسية
      </a>
      <a href={STORES_HREF} className={s.bottomLink} aria-current={current("/marketplace") ?? current("/store")}>
        <Store size={20} aria-hidden="true" />
        البسطات
      </a>
      <a href={loading ? undefined : merchantHref} aria-disabled={loading || undefined} className={`${s.bottomLink} ${s.bottomMerchant}`}>
        <Store size={20} aria-hidden="true" />
        {hasStore ? "لوحة التاجر" : "افتح بسطتك"}
      </a>
      <a href="/cart" className={s.bottomLink} aria-current={current("/cart")} aria-label={cartCount > 0 ? `السلة، ${cartCount} عناصر` : undefined}>
        <span className={s.bottomIcon}>
          <ShoppingCart size={20} aria-hidden="true" />
          {cartCount > 0 && <CountBadge count={cartCount} />}
        </span>
        السلة
      </a>
      <a href={loading ? undefined : user ? "/account" : "/login"} aria-disabled={loading || undefined} className={s.bottomLink} aria-current={current("/account")}>
        <UserRound size={20} aria-hidden="true" />
        حسابي
      </a>
    </nav>
  );
}
