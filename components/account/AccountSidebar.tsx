// components/account/AccountSidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  Home, ShoppingCart, Package, MapPin, Heart, Tag, Undo2, Headset, Settings,
  LogOut, type LucideIcon,
} from "lucide-react";
import s from "./account.module.css";

const REAL_LINKS: { href: string; Icon: LucideIcon; label: string }[] = [
  { href: "/account", Icon: Home, label: "الرئيسية" },
  { href: "/cart", Icon: ShoppingCart, label: "سلة التسوق" },
  { href: "#orders", Icon: Package, label: "طلباتي" },
  { href: "#addresses", Icon: MapPin, label: "عناويني" },
  { href: "/favorites", Icon: Heart, label: "المفضلة" },
  { href: "/offers", Icon: Tag, label: "قسائمي وكوبوناتي" },
  { href: "#orders", Icon: Undo2, label: "إرجاع واستبدال" },
  { href: "/dashboard/support", Icon: Headset, label: "الدعم والمساعدة" },
  { href: "/account/settings", Icon: Settings, label: "الإعدادات" },
];

export default function AccountSidebar() {
  const router = useRouter();

  return (
    <nav className={s.nav} aria-label="قائمة الحساب">
      {REAL_LINKS.map((l) => (
        <a key={l.label} href={l.href} className={s.navLink}>
          <l.Icon size={18} strokeWidth={1.7} aria-hidden="true" />
          {l.label}
        </a>
      ))}

      <button
        type="button"
        onClick={async () => { await getSupabaseBrowserClient().auth.signOut(); router.push("/"); router.refresh(); }}
        className={s.logout}
      >
        <LogOut size={18} strokeWidth={1.7} aria-hidden="true" /> تسجيل الخروج
      </button>
    </nav>
  );
}
