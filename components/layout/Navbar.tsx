// components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
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
        /* =========================================
           Tablet
           ========================================= */
        @media (max-width: 980px) and (min-width: 768px) {
          .basita-navbar-main {
            grid-template-columns: auto minmax(0, 1fr) auto !important;
            gap: 12px !important;
          }

          .basita-navbar-search {
            display: none !important;
          }
        }

        /* =========================================
           Mobile
           ========================================= */
        @media (max-width: 767px) {
          .basita-navbar-main {
            min-height: 58px !important;
            height: 58px;
            padding: 6px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 6px !important;
            overflow: hidden;
          }

          /* الشعار */
          .basita-navbar-logo {
            gap: 6px !important;
            flex: 0 0 auto;
            min-width: 0;
          }

          .basita-navbar-logo > div {
            width: 37px !important;
            height: 37px !important;
            border-radius: 10px !important;
          }

          .basita-navbar-logo img {
            width: 30px !important;
            height: 30px !important;
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

          /* إخفاء روابط سطح المكتب والبحث */
          .basita-navbar-navigation,
          .basita-navbar-search {
            display: none !important;
          }

          /* منطقة الإجراءات */
          .basita-navbar-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            flex: 0 1 auto !important;
            min-width: 0;
            gap: 4px !important;
            overflow: visible !important;
          }

          .basita-navbar-actions > * {
            flex-shrink: 0;
          }

          /*
           * نخلي منطقة الدخول والأيقونات متقاربة
           * لكن بدون ضغطها على بعضها.
           */
          .basita-navbar-actions :global(a),
          .basita-navbar-actions :global(button) {
            min-width: 34px;
          }
        }

        /* =========================================
           Small phones
           ========================================= */
        @media (max-width: 420px) {
          .basita-navbar-main {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .basita-navbar-logo {
            gap: 5px !important;
          }

          .basita-navbar-logo > div {
            width: 35px !important;
            height: 35px !important;
            border-radius: 9px !important;
          }

          .basita-navbar-logo img {
            width: 28px !important;
            height: 28px !important;
          }

          .basita-navbar-brand-text > span:first-child {
            font-size: 17px !important;
          }

          .basita-navbar-actions {
            gap: 2px !important;
          }

          .basita-navbar-actions :global(a),
          .basita-navbar-actions :global(button) {
            min-width: 32px;
          }
        }
      `}</style>
    </header>
  );
}