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
    router.push(search.trim() ? `/marketplace?search=${encodeURIComponent(search.trim())}` : "/marketplace");
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: t.colors.white, boxShadow: t.shadows.xs }}>
      <NavTopBar />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: `${t.spacing["5"]} ${t.spacing["4"]} ${t.spacing["4"]}`,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.spacing["6"],
          borderBottom: `1px solid ${t.colors.cream.borderLight}`,
          flexWrap: "wrap",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: t.spacing["3"], textDecoration: "none", flexShrink: 0 }}>
          <Image src="/images/logo-icon.png" alt="بسطة" width={44} height={44} />
          <span>
            <span style={{ display: "block", fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
              بسطة
            </span>
            <span style={{ display: "block", fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>منصة الأسر المنتجة السعودية</span>
          </span>
        </a>

        <SearchBar value={search} onChange={setSearch} onSubmit={submitSearch} />

        <div style={{ display: "flex", alignItems: "center", gap: t.spacing["5"] }}>
          <NavIconLinks userId={user?.id} />
          {user && <NotificationBell userId={user.id} />}
          <NavAuthArea user={user} loading={loading} />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["3"]} ${t.spacing["4"]}` }}>
        <NavLinks />
      </div>
    </header>
  );
}