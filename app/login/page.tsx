// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useCurrentUser } from "../providers";
import { t } from "@/theme";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthButton from "@/components/auth/AuthButton";
import AuthError from "@/components/auth/AuthError";
import AuthFooterLine from "@/components/auth/AuthFooterLine";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : authError.message
      );
      return;
    }

    // router.refresh() يُجبر Next.js على إعادة تشغيل Server Components بالكوكيز الجديدة
    // ثم refresh() يُحدِّث UserProvider بالمستخدم الجديد
    router.refresh();
    await refresh();

    // بيانات Supabase صحيحة هنا، فلو فشل /api/auth/me الآن فالسبب الأرجح
    // أن الحساب معلَّق (isActive=false) أو ملفه الداخلي غير مكتمل — وليس
    // خطأ دخول عادي. نوضّح ذلك للمستخدم بدل تحويله بصمت للرئيسية.
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      setLoading(false);
      setError("تعذّر تسجيل الدخول إلى حسابك — قد يكون حسابك معلّقاً أو غير نشط حالياً. تواصلي مع الدعم إذا استمرت المشكلة.");
      return;
    }

    setLoading(false);
    const { user } = await res.json();

    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

   // توجيه ذكي حسب الدور
if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
  router.push("/admin");
} else if (user.role === "SELLER") {
  router.push("/dashboard");
} else {
  router.push("/marketplace");
}
  };

  return (
    <AuthShell title="تسجيل الدخول" subtitle="أهلاً بك مجدداً في بسطة">
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
        <AuthField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} />
        <AuthField
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={setPassword}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <AuthError message={error} />

        <AuthButton
          onClick={handleSubmit}
          loading={loading}
          idleLabel="تسجيل الدخول"
          loadingLabel="جاري تسجيل الدخول..."
        />

        <AuthFooterLine prompt="نسيتِ كلمة المرور؟" linkLabel="استعادة" href="/reset-password" />
        <AuthFooterLine prompt="ليس لديك حساب؟" linkLabel="إنشاء حساب" href="/register" />
      </div>
    </AuthShell>
  );
}
