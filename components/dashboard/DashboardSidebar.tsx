// components/dashboard/DashboardSidebar.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { t } from "@/theme";
import {
  Home,
  Package,
  List,
  Plus,
  Receipt,
  Wallet,
  Store,
  Settings,
  CreditCard,
  FileText,
  Truck,
  Sparkles,
  Headset,
  User,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  Landmark,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

interface NavGroup {
  label: string;
  Icon: LucideIcon;
  items: NavItem[];
}

const TOP_LINK: NavItem = {
  href: "/dashboard",
  label: "الرئيسية",
  Icon: Home,
};

const GROUPS: NavGroup[] = [
  {
    label: "المنتجات",
    Icon: Package,
    items: [
      {
        href: "/dashboard/products",
        label: "كل المنتجات",
        Icon: List,
      },
      {
        href: "/dashboard/products/new",
        label: "إضافة منتج",
        Icon: Plus,
      },
    ],
  },
];

const MID_LINKS: NavItem[] = [
  {
    href: "/dashboard/orders",
    label: "الطلبات",
    Icon: Receipt,
  },
  {
    href: "/dashboard/daftari",
    label: "دفاتري",
    Icon: Wallet,
  },
];

const STORE_GROUP: NavGroup = {
  label: "المتجر",
  Icon: Store,
  items: [
    {
      href: "/dashboard#settings",
      label: "إعدادات المتجر",
      Icon: Settings,
    },
    {
      href: "/dashboard/payment-gateway",
      label: "بوابة الدفع",
      Icon: CreditCard,
    },
    {
      href: "/dashboard/bank-transfer",
      label: "التحويل البنكي",
      Icon: Landmark,
    },
    {
      href: "/dashboard/subscription",
      label: "الاشتراك والفوترة",
      Icon: FileText,
    },
    {
      href: "/dashboard/shipping",
      label: "الشحن",
      Icon: Truck,
    },
    {
      href: "/dashboard/marketing",
      label: "التسويق",
      Icon: Megaphone,
    },
    {
      href: "/dashboard/munira",
      label: "منيرة",
      Icon: Sparkles,
    },
  ],
};

const BOTTOM_LINKS: NavItem[] = [
  {
    href: "/dashboard/support",
    label: "الدعم",
    Icon: Headset,
  },
  {
    href: "/account/settings",
    label: "حسابي الشخصي",
    Icon: User,
  },
  {
    href: "/marketplace",
    label: "الماركت",
    Icon: ShoppingBag,
  },
];

const ALL_LEAF_LINKS: NavItem[] = [
  TOP_LINK,
  ...GROUPS.flatMap((group) => group.items),
  ...MID_LINKS,
  ...STORE_GROUP.items,
  ...BOTTOM_LINKS,
];

function isItemActive(item: NavItem, pathname: string) {
  if (item.href.includes("#")) {
    return pathname === item.href.split("#")[0];
  }

  return pathname === item.href;
}

function NavLink({
  item,
  pathname,
  mobile = false,
}: {
  item: NavItem;
  pathname: string;
  mobile?: boolean;
}) {
  const active = isItemActive(item, pathname);

  return (
    <a
      href={item.href}
      title={item.label}
      className={`basita-dashboard-nav-link ${
        active ? "is-active" : ""
      } ${mobile ? "is-mobile" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        minHeight: 44,
        padding: "0 13px",
        borderRadius: 13,
        textDecoration: "none",
        color: active
          ? t.colors.white
          : t.colors.text.onDarkMuted,
        background: active
          ? "rgba(255,255,255,0.11)"
          : "transparent",
        fontFamily: t.typography.fontFamily.base,
        fontSize: t.typography.fontSize.sm,
        fontWeight: active
          ? t.typography.fontWeight.bold
          : t.typography.fontWeight.medium,
        position: "relative",
        transition:
          `background ${t.motion.fast} ${t.motion.ease}, ` +
          `color ${t.motion.fast} ${t.motion.ease}, ` +
          `transform ${t.motion.fast} ${t.motion.ease}`,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {active && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 8,
            bottom: 8,
            width: 3,
            borderRadius: 999,
            background: t.colors.gold[400],
          }}
        />
      )}

      <item.Icon
        size={18}
        strokeWidth={1.9}
        style={{
          flexShrink: 0,
          color: active
            ? t.colors.gold[400]
            : t.colors.text.onDarkMuted,
        }}
      />

      {!mobile && (
        <span className="basita-dashboard-nav-label">
          {item.label}
        </span>
      )}
    </a>
  );
}

function NavGroupBlock({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const containsActive = group.items.some((item) =>
    isItemActive(item, pathname),
  );

  const [open, setOpen] = useState(containsActive);

  return (
    <div
      className="basita-dashboard-nav-group"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="basita-dashboard-group-button"
        aria-expanded={open}
        style={{
          width: "100%",
          minHeight: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 13px",
          border: "none",
          borderRadius: 12,
          background: "transparent",
          color: t.colors.text.onDarkMuted,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.semibold,
          cursor: "pointer",
          textAlign: "right",
          transition:
            `background ${t.motion.fast} ${t.motion.ease}, ` +
            `color ${t.motion.fast} ${t.motion.ease}`,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <group.Icon size={18} strokeWidth={1.9} />
          {group.label}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          style={{
            transform: open
              ? "rotate(0deg)"
              : "rotate(90deg)",
            transition:
              `transform ${t.motion.fast} ${t.motion.ease}`,
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            paddingRight: 10,
            paddingLeft: 0,
          }}
        >
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardSidebar({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const mobileItems = [
    ...ALL_LEAF_LINKS,
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "لوحة الإدارة",
            Icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <aside
      className="basita-dashboard-sidebar"
      style={{
        width: 268,
        flexShrink: 0,
        minHeight: "100vh",
        background: `linear-gradient(
          180deg,
          ${t.colors.primary[950]} 0%,
          ${t.colors.primary[900]} 55%,
          ${t.colors.primary[800]} 100%
        )`,
        display: "flex",
        flexDirection: "column",
        direction: "rtl",
        textAlign: "right",
        padding: "18px 14px",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 10px 30px rgba(15,61,46,0.10)",
        position: "relative",
        zIndex: 20,
        order: 2,
      }}
    >
      {/* رأس الشريط */}
      <div
        style={{
          padding: "4px 6px 16px",
          marginBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <a
          href="/"
          className="basita-dashboard-brand"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            }}
          >
            <Image
              src="/images/logo-icon.png"
              alt="بسطة"
              width={32}
              height={32}
              style={{
                width: 32,
                height: 32,
                objectFit: "contain",
              }}
            />
          </div>

          <div>
            <div
              style={{
                fontFamily: t.typography.fontFamily.heading,
                color: t.colors.text.onDark,
                fontSize: "20px",
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.15,
              }}
            >
              بسطة
            </div>

            <div
              style={{
                marginTop: 3,
                color: t.colors.text.onDarkMuted,
                fontSize: "10px",
                lineHeight: 1.3,
              }}
            >
              لوحة إدارة المتجر
            </div>
          </div>
        </a>
      </div>

      {/* القائمة */}
      <nav
        className="basita-sidebar-nav-desktop"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          overflowY: "auto",
          paddingTop: 3,
        }}
      >
        <NavLink
          item={TOP_LINK}
          pathname={pathname}
        />

        {GROUPS.map((group) => (
          <NavGroupBlock
            key={group.label}
            group={group}
            pathname={pathname}
          />
        ))}

        {MID_LINKS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
          />
        ))}

        <NavGroupBlock
          group={STORE_GROUP}
          pathname={pathname}
        />

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.08)",
            margin: "7px 4px",
          }}
        />

        {BOTTOM_LINKS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
          />
        ))}

        {isAdmin && (
          <div
            style={{
              marginTop: 6,
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <a
              href="/admin"
              className="basita-dashboard-admin-link basita-btn-interactive"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                minHeight: 44,
                padding: "0 13px",
                borderRadius: 12,
                textDecoration: "none",
                color: t.colors.gold[400],
                background: "rgba(221,179,95,0.08)",
                border: `1px solid rgba(221,179,95,0.25)`,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              <ShieldCheck size={18} strokeWidth={1.9} />
              لوحة الإدارة
            </a>
          </div>
        )}
      </nav>

      {/* نسخة الجوال */}
      <nav
        className="basita-sidebar-nav-mobile"
        style={{
          display: "none",
          alignItems: "center",
          gap: 7,
          overflowX: "auto",
          width: "100%",
          padding: "1px 0",
        }}
      >
        {mobileItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            mobile
          />
        ))}
      </nav>
    </aside>
  );
}