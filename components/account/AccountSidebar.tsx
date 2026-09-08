// components/account/AccountSidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { t } from "@/theme";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  Home, ShoppingCart, Package, MapPin, Heart, Tag, Undo2, Headset, Settings,
  Wallet, Star, MessageSquare, LogOut, type LucideIcon,
} from "lucide-react";

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

// ⚠️ لا يوجد أي backend model لهذه الميزات حالياً (لا Wallet، لا Points/Loyalty،
// لا listing endpoint للمراجعات أو المحادثات العامة) — معروضة كـ"قريباً" بدل
// اختراع بيانات أو روابط لصفحات لا تعمل.
const COMING_SOON: { Icon: LucideIcon; label: string }[] = [
  { Icon: Wallet, label: "محفظتي" },
  { Icon: Star, label: "نقاط بسطة" },
  { Icon: MessageSquare, label: "تقييماتي" },
  { Icon: MessageSquare, label: "محادثاتي" },
];

export default function AccountSidebar() {
  const router = useRouter();

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["3"], border: `1px solid ${t.colors.cream.border}` }}>
      {REAL_LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          style={{ display: "flex", alignItems: "center", gap: t.spacing["2"], padding: "10px 12px", borderRadius: t.radius.md, textDecoration: "none", color: t.colors.text.body, fontSize: t.typography.fontSize.sm }}
        >
          <l.Icon size={18} strokeWidth={1.7} />
          {l.label}
        </a>
      ))}

      {COMING_SOON.map((c) => (
        <div key={c.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", color: t.colors.text.light, fontSize: t.typography.fontSize.sm }}>
          <span style={{ display: "flex", alignItems: "center", gap: t.spacing["2"] }}>
            <c.Icon size={18} strokeWidth={1.7} />
            {c.label}
          </span>
          <span style={{ fontSize: 10, background: t.colors.cream.bg, padding: "2px 8px", borderRadius: t.radius.full }}>قريباً</span>
        </div>
      ))}

      <button
        onClick={async () => { await getSupabaseBrowserClient().auth.signOut(); router.push("/"); router.refresh(); }}
        style={{ display: "flex", alignItems: "center", gap: t.spacing["2"], width: "100%", padding: "10px 12px", borderRadius: t.radius.md, border: "none", background: t.colors.semantic.dangerBg, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.sm, cursor: "pointer", marginTop: t.spacing["2"], textAlign: "start" }}
      >
        <LogOut size={18} strokeWidth={1.7} /> تسجيل الخروج
      </button>
    </div>
  );
}
