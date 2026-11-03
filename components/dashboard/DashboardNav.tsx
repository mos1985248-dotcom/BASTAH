// components/dashboard/DashboardNav.tsx
// بيانات التنقل ومنطق «العنصر النشط» مشتركان بين القائمة الجانبية وشريط الجوال.
// كل الروابط السابقة محفوظة؛ التغيير في التجميع فقط (مبيعات / تنمية المتجر / إعدادات المتجر).
import {
  Home, List, Plus, Receipt, Wallet, Settings, CreditCard, FileText, Truck, Sparkles,
  Headset, User, ShoppingBag, Landmark, Megaphone, Plug, type LucideIcon,
} from "lucide-react";

export interface NavItem { href: string; label: string; Icon: LucideIcon }
export interface NavGroup { label: string; items: NavItem[] }

export const TOP_LINK: NavItem = { href: "/dashboard", label: "الرئيسية", Icon: Home };

export const GROUPS: NavGroup[] = [
  {
    label: "المبيعات",
    items: [
      { href: "/dashboard/orders", label: "الطلبات", Icon: Receipt },
      { href: "/dashboard/products", label: "كل المنتجات", Icon: List },
      { href: "/dashboard/products/new", label: "إضافة منتج", Icon: Plus },
      { href: "/dashboard/daftari", label: "دفاتري", Icon: Wallet },
    ],
  },
  {
    label: "تنمية المتجر",
    items: [
      { href: "/dashboard/marketing", label: "التسويق", Icon: Megaphone },
      { href: "/dashboard/integrations", label: "التكاملات", Icon: Plug },
      { href: "/dashboard/munira", label: "منيرة", Icon: Sparkles },
    ],
  },
  {
    label: "إعدادات المتجر",
    items: [
      { href: "/dashboard#settings", label: "إعدادات المتجر", Icon: Settings },
      { href: "/dashboard/shipping", label: "الشحن", Icon: Truck },
      { href: "/dashboard/payment-gateway", label: "بوابة الدفع", Icon: CreditCard },
      { href: "/dashboard/bank-transfer", label: "التحويل البنكي", Icon: Landmark },
      { href: "/dashboard/subscription", label: "الاشتراك والفوترة", Icon: FileText },
    ],
  },
];

export const BOTTOM_LINKS: NavItem[] = [
  { href: "/dashboard/support", label: "الدعم", Icon: Headset },
  { href: "/account/settings", label: "حسابي الشخصي", Icon: User },
  { href: "/marketplace", label: "الماركت", Icon: ShoppingBag },
];

export const ALL_ITEMS: NavItem[] = [TOP_LINK, ...GROUPS.flatMap((g) => g.items), ...BOTTOM_LINKS];

// الأطول تطابقاً يفوز: /dashboard/products/new لا يُنشّط «كل المنتجات»، و/dashboard/orders/123 يُنشّط «الطلبات».
export function activeHref(pathname: string): string | null {
  let best: string | null = null;
  for (const { href } of ALL_ITEMS) {
    const base = href.split("#")[0];
    const hit = href.includes("#") ? pathname === base : pathname === base || (base !== "/dashboard" && pathname.startsWith(base + "/"));
    if (hit && (!best || base.length >= best.split("#")[0].length)) best = href;
  }
  return best;
}
