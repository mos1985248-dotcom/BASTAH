// app/reset-password/page.tsx
// 3 خطوات: إدخال البريد → رابط Supabase (PKCE ?code=) يعيد للصفحة →
// المعالجة التلقائية داخل @supabase/auth-js (detectSessionInUrl) تُبادل
// الكود بجلسة وتُطلق PASSWORD_RECOVERY بنفسها → كلمة مرور جديدة

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import AuthShell from "@/components/auth/AuthShell";
import RequestStep from "@/components/auth/reset-steps/RequestStep";
import SentStep from "@/components/auth/reset-steps/SentStep";
import SetPasswordStep from "@/components/auth/reset-steps/SetPasswordStep";
import DoneStep from "@/components/auth/reset-steps/DoneStep";

type Step = "request" | "sent" | "set-password" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // الرابط الفعلي القادم من بريد Supabase يصل بصيغة PKCE: ?code=... —
  // لكن createBrowserClient يُهيّئ نفسه بـdetectSessionInUrl: true إجبارياً،
  // فيعالج @supabase/auth-js هذا الكود *تلقائياً* بمجرد إنشاء العميل
  // (GoTrueClient._initialize)، ويُطلق حدث PASSWORD_RECOVERY بنفسه دون أي
  // تدخّل يدوي. لا تستدعي exchangeCodeForSession هنا يدوياً — هذا كان يتسبب
  // فعلياً بخطأ حقيقي (AuthApiError: code verifier should be non-empty)
  // لأن الاستدعاء اليدوي يتسابق مع المعالجة التلقائية على نفس الـcode_verifier
  // ذي الاستخدام الواحد، فيفشل أيّهما يعمل ثانياً. الاستماع لـ
  // onAuthStateChange وحده كافٍ وصحيح 100%.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error_description");

    if (urlError) {
      setError(decodeURIComponent(urlError.replace(/\+/g, " ")));
      setStep("request");
      window.history.replaceState(null, "", window.location.pathname);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("set-password");
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleRequest = async () => {
    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "حدث خطأ");
        return;
      }
      setStep("sent");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "حدث خطأ");
        return;
      }
      setStep("done");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {step === "request" && (
        <RequestStep email={email} onEmailChange={setEmail} error={error} loading={loading} onSubmit={handleRequest} />
      )}
      {step === "sent" && <SentStep email={email} onResend={() => setStep("request")} />}
      {step === "set-password" && (
        <SetPasswordStep
          password={password}
          confirm={confirm}
          onPasswordChange={setPassword}
          onConfirmChange={setConfirm}
          error={error}
          loading={loading}
          onSubmit={handleSetPassword}
        />
      )}
      {step === "done" && <DoneStep onGoToLogin={() => router.push("/login")} />}
    </AuthShell>
  );
}
