// components/layout/NavLinks.tsx
"use client";

import { usePathname } from "next/navigation";
import { t } from "@/theme";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/marketplace", label: "تصفح المتاجر" },
  { href: "/marketplace#categories", label: "الأقسام" },
  { href: "/offers", label: "العروض" },
  { href: "/blog", label: "المدونة" },
  { href: "/dashboard/munira", label: "منيرة (AI)" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: t.spacing["6"],
        overflowX: "auto",
        paddingBottom: t.spacing["1"],
      }}
    >
      {LINKS.map((l) => {
        const active =
          l.href === "/"
            ? pathname === "/"
            : pathname.startsWith(l.href.split("?")[0]) && l.href !== "/";

        return (
          <a
            key={l.label}
            href={l.href}
            className={active ? undefined : "basita-nav-link"}
            style={{
              fontSize: t.typography.fontSize.base,
              fontWeight: active
                ? t.typography.fontWeight.semibold
                : t.typography.fontWeight.medium,
              color: active
                ? t.colors.primary[800]
                : t.colors.text.body,
              background: active
                ? t.colors.primary[100]
                : "transparent",
              padding: active
                ? `8px ${t.spacing["4"]}`
                : `8px ${t.spacing["1"]}`,
              borderRadius: t.radius.full,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition:
                `color ${t.motion.fast} ${t.motion.ease}, ` +
                `background ${t.motion.fast} ${t.motion.ease}`,
            }}
          >
            {l.label}
          </a>
        );
      })}

      <style>{`
        .basita-nav-link:hover {
          color: ${t.colors.primary[700]} !important;
        }
      `}</style>
    </nav>
  );
}