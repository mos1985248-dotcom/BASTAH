// components/layout/Navbar.tsx
"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { useCurrentUser } from "@/app/providers";
import NavTopBar from "./NavTopBar";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";
import NavAuthArea from "./NavAuthArea";
import NavIconLinks from "./NavIconLinks";
import SearchBar from "./SearchBar";
import { NotificationBell } from "@/components/NotificationBell";
import s from "./nav.module.css";

// الترويسة أعرض قليلاً من محتوى الصفحات لتتسع للروابط والبحث والأيقونات
const headerVars = { ...uiVars, "--nav-max": "1440px" } as CSSProperties;

export default function Navbar() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const submitSearch = () => {
    router.push(
      search.trim()
        ? `/marketplace?search=${encodeURIComponent(search.trim())}`
        : "/marketplace",
    );
    setSearchOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={s.header} style={headerVars}>
      <NavTopBar />

      <div className={s.main}>
        <button
          type="button"
          className={s.menuBtn}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {menuOpen ? <X size={20} strokeWidth={1.9} /> : <Menu size={20} strokeWidth={1.9} />}
        </button>

        {/* الشعار */}
        <a href="/" className={s.logo}>
          <span className={s.logoMark}>
            <Image
              src="/images/logo-icon.png"
              alt="بسطة مارت"
              width={36}
              height={36}
              priority
              style={{ width: 36, height: 36, objectFit: "contain", display: "block" }}
            />
          </span>
          <span className={s.brand}>
            <span className={s.brandName}>بسطة مارت</span>
            <span className={s.tagline}>منصة الأسر المنتجة السعودية</span>
          </span>
        </a>

        {/* روابط التنقل (الشاشات الكبيرة) */}
        <div className={s.nav}>
          <NavLinks />
        </div>

        {/* البحث (التابلت والكمبيوتر) */}
        <div className={s.search}>
          <SearchBar value={search} onChange={setSearch} onSubmit={submitSearch} />
        </div>

        {/* زر البحث (الجوال) */}
        <button
          type="button"
          className={s.toggleBtn}
          onClick={() => setSearchOpen((v) => !v)}
          aria-expanded={searchOpen}
          aria-label="البحث"
        >
          {searchOpen ? <X size={19} strokeWidth={1.9} /> : <Search size={19} strokeWidth={1.9} />}
        </button>

        {/* السلة والمفضلة والإشعارات والحساب */}
        <div className={s.actions}>
          <NavIconLinks userId={user?.id} />
          {user && (
            <span className={s.bellWrap}>
              <NotificationBell userId={user.id} />
            </span>
          )}
          <NavAuthArea user={user} loading={loading} />
        </div>
      </div>

      {searchOpen && (
        <div className={s.mobileSearch}>
          <SearchBar value={search} onChange={setSearch} onSubmit={submitSearch} />
        </div>
      )}
      {menuOpen && <MobileNav onNavigate={() => setMenuOpen(false)} />}
    </header>
  );
}
