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
        boxShadow: "0 3px 14px rgba(67,48,29,0.07)",
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
            gap: 10,
            textDecoration: "none",
            flexShrink: 0,
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
              boxShadow: "0 3px 10px rgba(67,48,29,0.05)",
            }}
          >
            <Image
              src="/images/logo-icon.png"
              alt="بسطة"
              width={34}
              height={34}
              style={{
                width: 34,
                height: 34,
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <span
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
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

        {/* الحساب والإشعارات */}
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
    </header>
  );
}