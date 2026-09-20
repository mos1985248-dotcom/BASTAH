// components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import NavTopBar from "./NavTopBar";
import NavLinks from "./NavLinks";
import NavAuthArea from "./NavAuthArea";
import NavIconLinks from "./NavIconLinks";
import SearchBar from "./SearchBar";
import { NotificationBell } from "@/components/NotificationBell";

export default function Navbar() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const submitSearch = () => {
    router.push(
      search.trim()
        ? `/marketplace?search=${encodeURIComponent(search.trim())}`
        : "/marketplace",
    );
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#FFFDF8",
        boxShadow: "0 2px 12px rgba(67,48,29,0.06)",
      }}
    >
      <NavTopBar />

      <div
        className="basita-navbar-main"
        style={{
          maxWidth: t.layout.containerMaxWidth,
          margin: "0 auto",
          minHeight: 72,
          padding: `8px ${t.spacing["4"]}`,
          display: "grid",
          gridTemplateColumns:
            "auto minmax(0, 1fr) minmax(220px, 300px) auto",
          alignItems: "center",
          gap: t.spacing["4"],
          boxSizing: "border-box",
          borderBottom: "1px solid rgba(91,70,45,0.08)",
        }}
      >
        {/* الشعار */}
        <a
          href="/"
          className="basita-navbar-logo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "#FFFFFF",
              border: "1px solid rgba(91,70,45,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(67,48,29,0.05)",
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/logo-icon.png"
              alt="بسطة"
              width={34}
              height={34}
              priority
              style={{
                width: 34,
                height: 34,
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <span
            className="basita-navbar-brand-text"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: t.typography.fontFamily.heading,
                fontSize: "21px",
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
                lineHeight: 1.1,
              }}
            >
              بسطة
            </span>

            <span
              className="basita-navbar-tagline"
              style={{
                display: "block",
                marginTop: 2,
                fontFamily: t.typography.fontFamily.heading,
                fontSize: "9px",
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.text.mid,
                lineHeight: 1.25,
                whiteSpace: "nowrap",
              }}
            >
              منصة الأسر المنتجة السعودية
            </span>
          </span>
        </a>

        {/* روابط التنقل */}
        <div
          className="basita-navbar-navigation"
          style={{
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <NavLinks />
        </div>

        {/* البحث */}
        <div
          className="basita-navbar-search"
          style={{
            minWidth: 0,
            width: "100%",
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            onSubmit={submitSearch}
          />
        </div>

        {/* بحث الجوال */}
        <a
          href="/marketplace"
          className="basita-navbar-mobile-search"
          aria-label="البحث"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 11,
            color: t.colors.primary[800],
            background: "#FFFDF8",
            border: "1px solid rgba(91,70,45,0.11)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Search size={18} strokeWidth={1.9} />
        </a>

        {/* الحساب والإشعارات والأيقونات */}
        <div
          className="basita-navbar-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <NavIconLinks userId={user?.id} />

          {user && <NotificationBell userId={user.id} />}

          <NavAuthArea user={user} loading={loading} />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 980px) and (min-width: 768px) {
          .basita-navbar-main {
            grid-template-columns: auto minmax(0, 1fr) auto !important;
            gap: 12px !important;
          }

          .basita-navbar-search {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .basita-navbar-main {
            min-height: 58px !important;
            height: 58px;
            padding: 6px 9px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 5px !important;
            overflow: visible !important;
          }

          .basita-navbar-logo {
            gap: 6px !important;
            flex: 0 0 auto;
            min-width: 0;
          }

          .basita-navbar-logo > div {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }

          .basita-navbar-logo img {
            width: 29px !important;
            height: 29px !important;
          }

          .basita-navbar-brand-text {
            display: flex !important;
          }

          .basita-navbar-brand-text > span:first-child {
            font-size: 18px !important;
          }

          .basita-navbar-tagline {
            display: none !important;
          }

          .basita-navbar-navigation,
          .basita-navbar-search {
            display: none !important;
          }

          .basita-navbar-mobile-search {
            display: inline-flex !important;
            margin-inline-start: auto;
          }

          .basita-navbar-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            flex: 0 0 auto !important;
            min-width: 0;
            gap: 4px !important;
            overflow: visible !important;
          }

          .basita-navbar-actions > * {
            flex-shrink: 0;
          }

          .basita-navbar-actions :global(a),
          .basita-navbar-actions :global(button) {
            min-width: 34px;
          }

          /*
           * الجوال:
           * تسجيل الدخول يظهر.
           * زر "ابدأ مجانًا" في شريط التنقل يختفي،
           * لأنه أصبح داخل الهيرو.
           */
          .basita-navbar-actions :global(.basita-nav-register) {
            display: none !important;
          }

          .basita-navbar-actions :global(.basita-nav-login) {
            min-height: 36px !important;
            padding: 0 7px !important;
            border-radius: 10px !important;
            font-size: 11px !important;
            gap: 4px !important;
            white-space: nowrap !important;
          }

          .basita-navbar-actions :global(.basita-nav-login svg) {
            width: 14px !important;
            height: 14px !important;
          }

          .basita-navbar-actions :global(.basita-nav-icon) {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }

          .basita-navbar-actions :global(.basita-nav-icon svg) {
            width: 17px !important;
            height: 17px !important;
          }

          /*
           * الإشعارات ليست جزءًا من ترتيب المستخدم المطلوب على الجوال.
           */
          .basita-navbar-actions :global(
              [aria-label*="الإشعارات"]
            ) {
            display: none !important;
          }
        }

        @media (max-width: 420px) {
          .basita-navbar-main {
            padding-left: 6px !important;
            padding-right: 6px !important;
            gap: 3px !important;
          }

          .basita-navbar-logo {
            gap: 4px !important;
          }

          .basita-navbar-logo > div {
            width: 34px !important;
            height: 34px !important;
            border-radius: 9px !important;
          }

          .basita-navbar-logo img {
            width: 27px !important;
            height: 27px !important;
          }

          .basita-navbar-brand-text > span:first-child {
            font-size: 17px !important;
          }

          .basita-navbar-mobile-search {
            width: 34px !important;
            height: 34px !important;
          }

          .basita-navbar-actions {
            gap: 2px !important;
          }

          .basita-navbar-actions :global(.basita-nav-icon) {
            width: 33px !important;
            height: 33px !important;
          }

          .basita-navbar-actions :global(.basita-nav-login) {
            min-height: 34px !important;
            padding: 0 5px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </header>
  );
}