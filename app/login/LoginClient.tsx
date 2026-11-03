"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useCurrentUser } from "../providers";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthButton from "@/components/auth/AuthButton";
import AuthError from "@/components/auth/AuthError";
import AuthFooterLine from "@/components/auth/AuthFooterLine";
import AuthMethodTabs, { type AuthMethod } from "@/components/auth/AuthMethodTabs";
import GoogleButton from "@/components/auth/GoogleButton";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";
import { finishLogin, safeRedirect } from "@/components/auth/finishLogin";
import s from "@/components/auth/auth.module.css";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useCurrentUser();

  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // callback يعيد إلى هنا بـ?error=oauth عند فشل الدخول عبر Google
  const [error, setError] = useState(searchParams.get("error") === "oauth" ? "تعذّر الدخول عبر Google، حاول مجدداً." : "");
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect");

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("البريد الإلكتروني وكلمة المرور مطلوبان");
      return;
    }

    setError("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setLoading(false);
      setError(
        authError.message === "Invalid login credentials"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة. إن كان حسابك عبر Google أو الجوال فادخل بالطريقة نفسها."
          : authError.message
      );
      return;
    }

    const message = await finishLogin(router, refresh, redirectTo);
    setLoading(false);
    if (message) setError(message);
  };

  return (
    <AuthShell title="تسجيل الدخول" subtitle="أهلاً بك مجدداً في بسطة" scene="heritage">
      <div className={s.stack}>
        <GoogleButton label="المتابعة باستخدام Google" next={safeRedirect(redirectTo)} />

        <p className={s.divider}>أو</p>

        <AuthMethodTabs value={method} onChange={(m) => { setMethod(m); setError(""); }} />

        {method === "email" ? (
          <>
            <AuthField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} autoComplete="email" />

            <AuthField
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={setPassword}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="current-password"
            />

            <AuthError message={error} />

            <AuthButton onClick={handleSubmit} loading={loading} idleLabel="تسجيل الدخول" loadingLabel="جاري تسجيل الدخول..." />

            <AuthFooterLine prompt="نسيت كلمة المرور؟" linkLabel="استعادة" href="/reset-password" />
          </>
        ) : (
          <>
            {error && <AuthError message={error} />}
            <PhoneAuthForm mode="login" redirectTo={redirectTo} />
          </>
        )}

        <AuthFooterLine prompt="ليس لديك حساب؟" linkLabel="إنشاء حساب" href="/register" />
      </div>
    </AuthShell>
  );
}
