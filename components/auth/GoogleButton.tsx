// components/auth/GoogleButton.tsx
// الدخول/التسجيل عبر Google (OAuth PKCE عبر Supabase). العودة إلى /auth/callback الذي يبدّل الرمز بجلسة
// ويوجّه حسب الدور. عند التسجيل نحفظ الدور المختار بكوكي قصير العمر يقرؤه callback للحساب الجديد فقط.
"use client";

import { useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import AuthError from "./AuthError";
import s from "./auth.module.css";

export default function GoogleButton({
  label,
  role,
  next,
}: {
  label: string;
  role?: "SELLER" | "BUYER";
  next?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");

    if (role) {
      document.cookie = `basita_signup_role=${role}; path=/; max-age=600; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    }

    const callback = new URL("/auth/callback", window.location.origin);
    if (next) callback.searchParams.set("next", next);

    const { error: oauthError } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    if (oauthError) {
      setLoading(false);
      setError("تعذّر الاتصال بـ Google، حاول مجدداً.");
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} disabled={loading} className={s.google}>
        <Image src="/images/google-g.svg" alt="" width={20} height={20} />
        {loading ? "جاري التحويل إلى Google..." : label}
      </button>
      <AuthError message={error} />
    </>
  );
}
