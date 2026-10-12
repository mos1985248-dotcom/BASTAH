// components/admin/layout/sections.ts

import {
  ClipboardList,
  Headset,
  LayoutDashboard,
  Plug,
  Newspaper,
  Settings,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSection =
  | "overview"
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
  {
    id: "audit",
    label: "سجل العمليات",
    Icon: ClipboardList,
  },
];