// components/layout/NavAuthArea.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogIn, Store, UserRound, LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import s from "./navctl.module.css";

interface CurrentUser {
  name: string;
  role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
  store: { slug: string } | null;
}

export default function NavAuthArea({
  user,
  loading,
}: {
  user: CurrentUser | null;
  loading: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  if (loading) {
    return <div className={`${s.authLoading} basita-auth-loading`} />;
  }

  if (!user) {
    return (
      <div className={`${s.auth} basita-nav-auth`}>
        {/* تسجيل الدخول */}
        <a href="/login" className={`${s.login} basita-nav-login`} aria-label="تسجيل الدخول">
          <LogIn size={17} strokeWidth={1.9} />
          <span className={s.loginText}>تسجيل الدخول</span>
        </a>
        {/* ابدأ مجانًا — يظهر على الكمبيوتر فقط */}
        <a href="/register" className={`${s.register} basita-nav-register basita-btn-interactive`}>
          ابدأ مجانًا
        </a>
      </div>
    );
  }

  const dashboardHref =
    user.role === "SELLER" && user.store ? "/dashboard" : "/account";
  const firstName = user.name?.split(" ")[0] || "حسابي";

  return (
    <div ref={ref} className={`${s.auth} basita-nav-auth`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="قائمة الحساب"
        className={s.account}
      >
        <span className={s.avatar}>
          <UserRound size={16} strokeWidth={1.8} />
        </span>
        <span className={s.accountName}>{firstName}</span>
        <ChevronDown size={15} strokeWidth={1.9} className={`${s.chevron} ${open ? s.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={s.menu}>
          <a href={dashboardHref} onClick={() => setOpen(false)} className={s.menuItem}>
            {user.role === "SELLER" ? <Store size={16} strokeWidth={1.8} /> : <UserRound size={16} strokeWidth={1.8} />}
            <span>{user.role === "SELLER" ? "لوحة متجري" : "حسابي"}</span>
          </a>

          {/* ⚠️ للتاجر تحديداً: /account هو أيضاً مكان زر "التبديل لحساب
              مشتري" (راجع RoleSwitchCard) — بدون هذا الرابط لا طريقة له
              للوصول إليه، لأن "لوحة متجري" أعلاه تأخذه لـ/dashboard فقط. */}
          {user.role === "SELLER" && (
            <a href="/account" onClick={() => setOpen(false)} className={s.menuItem}>
              <UserRound size={16} strokeWidth={1.8} />
              <span>حسابي الشخصي</span>
            </a>
          )}

          <button
            type="button"
            onClick={async () => {
              await getSupabaseBrowserClient().auth.signOut();
              setOpen(false);
              router.push("/");
              router.refresh();
            }}
            className={`${s.menuItem} ${s.logout}`}
          >
            <LogOut size={16} strokeWidth={1.8} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
