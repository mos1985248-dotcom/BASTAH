// app/register/page.tsx
// ثلاث طرق للتسجيل: Google، رقم الجوال (رمز)، أو البريد وكلمة المرور. الدور (متجر/مشتري) والاسم مشتركان.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "../providers";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthButton from "@/components/auth/AuthButton";
import AuthError from "@/components/auth/AuthError";
import AuthFooterLine from "@/components/auth/AuthFooterLine";
import RoleSelect from "@/components/auth/RoleSelect";
import EmailConfirmNotice from "@/components/auth/EmailConfirmNotice";
import AuthMethodTabs, { type AuthMethod } from "@/components/auth/AuthMethodTabs";
import GoogleButton from "@/components/auth/GoogleButton";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";
import s from "@/components/auth/auth.module.css";

type Role = "SELLER" | "BUYER";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: userLoading, refresh } = useCurrentUser();

  const [method, setMethod] = useState<AuthMethod>("email");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "SELLER" as Role });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  // مستخدم مسجّل دخوله بالفعل وصل لصفحة التسجيل (مثلاً من زر "اشترك
  // الآن" بصفحة /pricing) — نوجّهه لمكانه الصحيح بدل نموذج تسجيل جديد
  // فارغ يطلب منه بيانات لديه أصلاً.
  useEffect(() => {
    if (!userLoading && user) {
      router.replace(user.role === "SELLER" ? "/dashboard" : "/marketplace");
    }
  }, [userLoading, user, router]);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || form.password.length < 8) {
      setError("تأكد من تعبئة الاسم والبريد، وكلمة المرور 8 أحرف على الأقل");
      return;
    }
    setError("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        // ⚠️ حرِج: لو كان تأكيد البريد مفعَّلاً بمشروع Supabase، رابط
        // التأكيد يُعيد المستخدم لصفحة عشوائية (الرئيسية غالباً) لا تستدعي
        // /api/auth/sync أبداً — فيضيع الدور المُختار هنا نهائياً. تخزين
        // هذه البيانات كـuser_metadata يجعلها تصل لأي مكان يُنشئ الجلسة
        // لاحقاً (lib/auth.ts يقرأها تلقائياً عند أول طلب مُصادَق).
        data: { name: form.name, phone: form.phone || null, role: form.role },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // لو لا توجد جلسة فورية، المشروع يتطلب تأكيد البريد قبل تسجيل الدخول
    if (!data.session) {
      setLoading(false);
      setNeedsEmailConfirm(true);
      return;
    }

    try {
      await api.post("/api/auth/sync", { name: form.name, phone: form.phone || undefined, role: form.role });
      await refresh();
      router.push(form.role === "SELLER" ? "/dashboard" : "/marketplace");
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ عند إنشاء الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  if (needsEmailConfirm) {
    return <EmailConfirmNotice email={form.email} />;
  }

  // نتجنّب رمشة نموذج فارغ لمستخدم سيُوجَّه فوراً لمكانه الصحيح
  if (userLoading || user) {
    return <AuthShell title="إنشاء حساب جديد" subtitle=" " scene="souq"><div /></AuthShell>;
  }

  return (
    <AuthShell title="إنشاء حساب جديد" subtitle="انضم إلى بسطة — سوق الأسر المنتجة السعودية" scene="souq">
      <div className={s.stack}>
        <RoleSelect value={form.role} onChange={(v) => set("role", v)} />

        <GoogleButton label="التسجيل باستخدام Google" role={form.role} />

        <p className={s.divider}>أو</p>

        <AuthField label="الاسم الكامل" value={form.name} onChange={(v) => set("name", v)} autoComplete="name" />

        <AuthMethodTabs value={method} onChange={(m) => { setMethod(m); setError(""); }} />

        {method === "email" ? (
          <>
            <AuthField label="البريد الإلكتروني" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
            <AuthField label="رقم الجوال (اختياري)" type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+9665XXXXXXXX" inputMode="tel" ltr />
            <AuthField
              label="كلمة المرور (8 أحرف على الأقل)"
              type="password"
              value={form.password}
              onChange={(v) => set("password", v)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="new-password"
            />

            <AuthError message={error} />

            <AuthButton onClick={handleSubmit} loading={loading} idleLabel="إنشاء الحساب" loadingLabel="جاري إنشاء الحساب..." />
          </>
        ) : (
          <PhoneAuthForm mode="register" name={form.name} role={form.role} />
        )}

        <AuthFooterLine prompt="لديك حساب؟" linkLabel="تسجيل الدخول" href="/login" />
      </div>
    </AuthShell>
  );
}
