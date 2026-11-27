"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/app/providers";
import { useNavCounts } from "./NavIconLinks";
import MobileBottomNav from "./MobileBottomNav";
import s from "./nav.module.css";

const publicRoots = ["/marketplace", "/store", "/products", "/cart", "/checkout", "/account", "/favorites", "/orders", "/offers", "/blog", "/story", "/about", "/faq", "/pricing", "/payment-policy", "/privacy", "/returns-policy", "/shipping-policy", "/terms"];

function PublicBottomNav() {
  const { user, loading } = useCurrentUser();
  const { cartCount } = useNavCounts(user?.id);
  return <MobileBottomNav user={user} loading={loading} cartCount={cartCount} />;
}

export default function PublicMobileNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const show = pathname === "/" || publicRoots.some((root) => pathname === root || pathname.startsWith(root + "/"));
  return <div className={show ? s.publicMobileShell : undefined}>{children}{show && <PublicBottomNav />}</div>;
}
