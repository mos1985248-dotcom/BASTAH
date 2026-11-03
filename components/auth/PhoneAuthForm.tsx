// components/auth/PhoneAuthForm.tsx
// الدخول/التسجيل برقم الجوال: خطوتان (رقم ← رمز). الرمز يُرسل عبر Supabase ثم /api/auth/sms-hook.
// login: لا يُنشئ حساباً (shouldCreateUser: false). register: يُنشئ حساباً بالاسم والدور المختارين.
// صف جدول users يُنشأ تلقائياً عند أول طلب مُصادَق (lib/auth.ts).
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { normalizeSaudiMobile } from "@/lib/phone";
import { useCurrentUser } from "@/app/providers";
import AuthField from "./AuthField";
import AuthButton from "./AuthButton";
import AuthError from "./AuthError";
import { finishLogin } from "./finishLogin";
import s from "./auth.module.css";

function sendErrorMessage(err: { message: string; status?: number }): string {
  const msg = err.message.toLowerCase();
  if (msg.includes("signups not allowed") || msg.includes("user not found")) {
    return "لا يوجد حساب بهذا الرقم. أنشئ حساباً جديداً أولاً.";
  }
  if (err.status === 429 || msg.includes("rate limit") || msg.includes("too many") || msg.includes("seconds")) {
    return "طلبات كثيرة، انتظر قليلاً ثم حاول مجدداً.";
  }
  // رسائل مسار الـhook عندنا بالعربية (مثل: الدخول بالجوال متاح للأرقام السعودية فقط)
  return /[\u0600-\u06FF]/.test(err.message) ? err.message : "تعذّر إرسال الرمز، حاول مجدداً.";
}

export default function PhoneAuthForm({
  mode,
  name = "",
  role,
  redirectTo = null,
}: {
  mode: "login" | "register";
  name?: string;
  role?: "SELLER" | "BUYER";
  redirectTo?: string | null;
}) {
  const router = useRouter();
  const { refresh } = useCurrentUser();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const e164 = normalizeSaudiMobile(phone);

  const sendCode = async () => {
    if (mode === "register" && name.trim().length < 2) {
      setError("اكتب اسمك الكامل أولاً (حرفان على الأقل).");
      return;
    }
    if (!e164) {
      setError("أدخل رقم جوال سعودي صحيح، مثل 0512345678");
      return;
    }

    setError("");
    setLoading(true);

    const { error: otpError } = await getSupabaseBrowserClient().auth.signInWithOtp({
      phone: e164,
      options: {
        shouldCreateUser: mode === "register",
        data: mode === "register" ? { name: name.trim(), role } : undefined,
      },
    });

    setLoading(false);
    if (otpError) {
      setError(sendErrorMessage(otpError));
      return;
    }

    setCode("");
    setStep("code");
    setCooldown(60);
  };

  const verify = async () => {
    if (!e164 || !/^\d{4,10}$/.test(code.trim())) {
      setError("أدخل رمز التحقق الذي وصلك.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: verifyError } = await getSupabaseBrowserClient().auth.verifyOtp({
      phone: e164,
      token: code.trim(),
      type: "sms",
    });

    if (verifyError) {
      setLoading(false);
      setError("الرمز غير صحيح أو انتهت صلاحيته.");
      return;
    }

    const message = await finishLogin(router, refresh, redirectTo);
    setLoading(false);
    if (message) setError(message);
  };

  if (step === "code") {
    return (
      <div className={s.stack}>
        <p className={s.stepText}>
          أرسلنا رمز التحقق إلى <strong dir="ltr">{e164}</strong>
        </p>

        <AuthField
          label="رمز التحقق"
          value={code}
          onChange={(v) => setCode(v.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && verify()}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          otp
        />

        <AuthError message={error} />

        <AuthButton
          onClick={verify}
          loading={loading}
          idleLabel={
            <>
              تأكيد ومتابعة
              <ArrowLeft size={15} strokeWidth={2} />
            </>
          }
          loadingLabel="جاري التحقق..."
        />

        <div className={s.rowBetween}>
          <button type="button" className={s.linkBtn} onClick={() => { setStep("phone"); setError(""); }}>
            <Pencil size={13} strokeWidth={2} /> تغيير الرقم
          </button>
          <button type="button" className={s.linkBtn} disabled={cooldown > 0 || loading} onClick={sendCode}>
            {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown} ث` : "إعادة إرسال الرمز"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.stack}>
      <AuthField
        label="رقم الجوال"
        type="tel"
        value={phone}
        onChange={setPhone}
        onKeyDown={(e) => e.key === "Enter" && sendCode()}
        placeholder="05XXXXXXXX"
        inputMode="tel"
        autoComplete="tel"
        ltr
        hint="أرقام الجوال السعودية فقط. سنرسل لك رمز تحقق."
      />

      <AuthError message={error} />

      <AuthButton
        onClick={sendCode}
        loading={loading}
        idleLabel={
          <>
            إرسال رمز التحقق
            <ArrowLeft size={15} strokeWidth={2} />
          </>
        }
        loadingLabel="جاري الإرسال..."
      />
    </div>
  );
}
