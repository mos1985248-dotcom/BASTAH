// components/dashboard/QuickActionsBar.tsx
import { Headset, Plus, Receipt, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./home.module.css";

const ACTIONS: { href: string; Icon: LucideIcon; label: string }[] = [
  { href: "/dashboard/products/new", Icon: Plus, label: "إضافة منتج" },
  { href: "/dashboard/orders", Icon: Receipt, label: "الطلبات" },
  { href: "/dashboard/daftari", Icon: Wallet, label: "دفاتري" },
  { href: "/dashboard/munira", Icon: Sparkles, label: "منيرة" },
  { href: "/dashboard/support", Icon: Headset, label: "الدعم" },
];

export default function QuickActionsBar() {
  return (
    <nav className={s.actions} style={uiVars} aria-label="اختصارات سريعة">
      {ACTIONS.map(({ href, Icon, label }) => (
        <a key={href} href={href} className={s.act}>
          <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
          {label}
        </a>
      ))}
    </nav>
  );
}
