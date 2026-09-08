// components/dashboard/DashboardSidebar.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { t } from "@/theme";
import {
  Home, Package, List, Plus, Receipt, Wallet, Store, Settings, CreditCard,
  FileText, Truck, Sparkles, Headset, User, ShoppingBag, ShieldCheck, ChevronDown,
  Landmark, Megaphone,
  type LucideIcon,
} from "lucide-react";

interface NavItem { href: string; label: string; Icon: LucideIcon }
interface NavGroup { label: string; Icon: LucideIcon; items: NavItem[] }

const TOP_LINK: NavItem = { href: "/dashboard", label: "الرئيسية", Icon: Home };

const GROUPS: NavGroup[] = [
  {
    label: "المنتجات", Icon: Package,
    items: [
      { href: "/dashboard/products", label: "كل المنتجات", Icon: List },
      { href: "/dashboard/products/new", label: "إضافة منتج", Icon: Plus },
    ],
  },
];

const MID_LINKS: NavItem[] = [
  { href: "/dashboard/orders", label: "الطلبات", Icon: Receipt },
  { href: "/dashboard/daftari", label: "دفاتري", Icon: Wallet },
];

const STORE_GROUP: NavGroup = {
  label: "المتجر", Icon: Store,
  items: [
    { href: "/dashboard#settings", label: "إعدادات المتجر", Icon: Settings },
    { href: "/dashboard/payment-gateway", label: "بوابة الدفع", Icon: CreditCard },
    { href: "/dashboard/bank-transfer", label: "التحويل البنكي", Icon: Landmark },
    { href: "/dashboard/subscription", label: "الاشتراك والفوترة", Icon: FileText },
    { href: "/dashboard/shipping", label: "الشحن", Icon: Truck },
    { href: "/dashboard/marketing", label: "التسويق", Icon: Megaphone },
    { href: "/dashboard/munira", label: "منيرة", Icon: Sparkles },
  ],
};

const BOTTOM_LINKS: NavItem[] = [
  { href: "/dashboard/support", label: "الدعم", Icon: Headset },
  { href: "/account/settings", label: "حسابي الشخصي", Icon: User },
  { href: "/marketplace", label: "الماركت", Icon: ShoppingBag },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname === item.href;
  return (
    <a
      href={item.href}
      title={item.label}
      style={{
        display: "flex", alignItems: "center", gap: t.spacing["3"], padding: "10px 14px",
        borderRadius: t.radius.md, whiteSpace: "nowrap",
        color: active ? t.colors.white : t.colors.text.onDarkMuted,
        background: active ? "rgba(255,255,255,0.14)" : "transparent",
        fontSize: t.typography.fontSize.sm, fontWeight: active ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
        textDecoration: "none", transition: `background ${t.motion.fast} ${t.motion.ease}`,
      }}
    >
      <item.Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0, color: active ? t.colors.gold[400] : t.colors.text.onDarkMuted }} />
      <span className="basita-sidebar-label">{item.label}</span>
    </a>
  );
}

function NavGroupBlock({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState<boolean>(group.items.some((i) => i.href === pathname) || true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="basita-sidebar-label"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
          padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
          color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: t.spacing["3"] }}>
          <group.Icon size={18} strokeWidth={1.8} /> {group.label}
        </span>
        <ChevronDown size={15} style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: `transform ${t.motion.fast} ${t.motion.ease}` }} />
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingInlineStart: t.spacing["4"] }} className="basita-sidebar-label">
          {group.items.map((i) => (
            <NavLink key={i.href} item={i} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

const ALL_LEAF_LINKS: NavItem[] = [
  TOP_LINK,
  ...GROUPS.flatMap((g) => g.items),
  ...MID_LINKS,
  ...STORE_GROUP.items,
  ...BOTTOM_LINKS,
];

export default function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className="basita-dashboard-sidebar"
      style={{
        width: 250, flexShrink: 0,
        background: `linear-gradient(180deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`,
        minHeight: "100vh", padding: `${t.spacing["5"]} ${t.spacing["4"]}`,
        display: "flex", flexDirection: "column", gap: t.spacing["4"],
        direction: "rtl", textAlign: "right",
        borderLeft: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: t.shadows.lg,
        order: 2, // ضمان تمركز القائمة في اليمين داخل التخطيط المرن (Flexbox)
      }}
    >
      <a href="/" className="basita-sidebar-logo" style={{ display: "flex", alignItems: "center", gap: t.spacing["3"], textDecoration: "none", flexShrink: 0, marginBottom: t.spacing["2"], paddingInline: t.spacing["2"] }}>
        <div style={{ width: 34, height: 34, borderRadius: t.radius.full, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${t.colors.gold[400]}` }}>
          <Store size={18} color={t.colors.gold[400]} strokeWidth={1.8} />
        </div>
        <span style={{ color: t.colors.text.onDark, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, letterSpacing: "-0.01em" }}>بسطة</span>
      </a>

      {/* نسخة سطح المكتب — مجموعات قابلة للطي */}
      <nav className="basita-sidebar-nav-desktop" style={{ display: "flex", flexDirection: "column", gap: t.spacing["1"] }}>
        <NavLink item={TOP_LINK} pathname={pathname} />
        {GROUPS.map((g) => (
          <NavGroupBlock key={g.label} group={g} pathname={pathname} />
        ))}
        {MID_LINKS.map((l) => (
          <NavLink key={l.href} item={l} pathname={pathname} />
        ))}
        <NavGroupBlock group={STORE_GROUP} pathname={pathname} />
        {BOTTOM_LINKS.map((l) => (
          <NavLink key={l.href} item={l} pathname={pathname} />
        ))}

        {isAdmin && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: t.spacing["3"], paddingTop: t.spacing["3"] }}>
            <a href="/admin" className="basita-btn-interactive" style={{ display: "flex", alignItems: "center", gap: t.spacing["3"], padding: "10px 14px", borderRadius: t.radius.md, color: t.colors.gold[400], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, textDecoration: "none", background: "rgba(217, 119, 6, 0.15)", border: `1px solid ${t.colors.gold[400]}` }}>
              <ShieldCheck size={18} strokeWidth={1.8} /> لوحة الإدارة
            </a>
          </div>
        )}
      </nav>

      {/* نسخة الجوال — قائمة مسطّحة أيقونات فقط */}
      <nav className="basita-sidebar-nav-mobile" style={{ display: "none", flexDirection: "row", gap: t.spacing["1"] }}>
        {[...ALL_LEAF_LINKS, ...(isAdmin ? [{ href: "/admin", label: "لوحة الإدارة", Icon: ShieldCheck }] : [])].map((l) => (
          <NavLink key={l.href} item={l} pathname={pathname} />
        ))}
      </nav>

      <style>{`
        @media (max-width: 820px) {
          .basita-dashboard-sidebar {
            width: 100% !important; min-height: auto !important; flex-direction: row !important;
            align-items: center; gap: ${t.spacing["3"]} !important;
            padding: ${t.spacing["3"]} ${t.spacing["4"]} !important; overflow-x: auto;
            border-left: none !important; border-bottom: 1px solid rgba(255,255,255,0.08);
            order: unset !important;
          }
          .basita-sidebar-logo { display: none; }
          .basita-sidebar-nav-desktop { display: none !important; }
          .basita-sidebar-nav-mobile { display: flex !important; }
          .basita-sidebar-nav-mobile span:last-child { display: none; }
        }
      `}</style>
    </aside>
  );
}