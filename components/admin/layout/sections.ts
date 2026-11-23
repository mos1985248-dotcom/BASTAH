// components/admin/layout/sections.ts

import {
  ClipboardList,
  Headset,
  Landmark,
  LayoutDashboard,
  Plug,
  Newspaper,
  Settings,
  Bot,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSection =
  | "overview"
  | "finance"
  | "munira"
  | "entitlements"
  | "stores"
  | "users"
  | "support"
  | "blog"
  | "settings"
  | "shipping"
  | "integrations"
  | "audit";

export const ADMIN_SECTIONS: {
  id: AdminSection;
  label: string;
  Icon: LucideIcon;
}[] = [
  {
    id: "overview",
    label: "نظرة عامة",
    Icon: LayoutDashboard,
  },
  {
    id: "finance",
    label: "المركز المالي",
    Icon: Landmark,
  },
  {
    id: "stores",
    label: "المتاجر",
    Icon: Store,
  },
  {
    id: "users",
    label: "المستخدمون",
    Icon: Users,
  },
  {
    id: "support",
    label: "الدعم",
    Icon: Headset,
  },
  {
    id: "blog",
    label: "المدونة",
    Icon: Newspaper,
  },
  {
    id: "settings",
    label: "إعدادات المنصة",
    Icon: Settings,
  },
  {
    id: "shipping",
    label: "شركات الشحن",
    Icon: Truck,
  },
  {
    id: "integrations",
    label: "التكاملات",
    Icon: Plug,
  },
  { id: "munira", label: "مزودات منيرة", Icon: Bot },
  { id: "entitlements", label: "إدارة المميزات والصلاحيات", Icon: Settings },
  {
    id: "audit",
    label: "سجل العمليات",
    Icon: ClipboardList,
  },
];