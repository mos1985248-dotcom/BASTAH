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
          padding: `${t.spacing["4"]} ${t.spacing["4"]}`,
          display: "grid",
          gridTemplateColumns: "auto minmax(280px, 1fr) auto",
          alignItems: "center",
          gap: t.spacing["6"],
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
            gap: t.spacing["3"],
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          {/* أيقونة الشعار */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
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

          {/* اسم المنصة */}
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* بسطة */}
            <span
              style={{
                display: "block",
                fontFamily: t.typography.fontFamily.heading,
                fontSize: "22px",
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
                lineHeight: 1.15,
              }}
            >
              بسطة
            </span>

            {/* النص أسفل الشعار */}
            <span
              style={{
                display: "block",
                marginTop: 3,
                fontFamily: t.typography.fontFamily.heading,
                fontSize: "10px",
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.text.mid,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              منصة الأسر المنتجة السعودية
            </span>
          </span>
        </a>

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
            gap: t.spacing["3"],
            flexShrink: 0,
          }}
        >
          <NavIconLinks userId={user?.id} />

          {user && <NotificationBell userId={user.id} />}

          <NavAuthArea user={user} loading={loading} />
        </div>
      </div>

      {/* روابط التنقل */}
      <div
        className="basita-navbar-links"
        style={{
          maxWidth: t.layout.containerMaxWidth,
          margin: "0 auto",
          padding: `0 ${t.spacing["4"]}`,
        }}
      >
        <div
          style={{
            minHeight: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NavLinks />
        </div>
      </div>
    </header>
  );
}