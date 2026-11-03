// app/account/settings/page.tsx
// إعدادات الحساب الشخصي — لكل من المشتري والتاجر (بيانات User، لا علاقة
// لها بإعدادات المتجر الموجودة بلوحة التاجر). GET/PATCH /api/users/me،
// رفع الصورة عبر POST /api/uploads/avatar. تعديل البريد مؤجَّل عمداً —
// يحتاج تدفق تحقق حقيقي عبر Supabase قبل اعتماده.
// المنطق (الجلب والحفظ والتحقق من التغيير) كما كان حرفياً؛ التغيير في العرض فقط.
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "@/app/providers";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import SiteShell from "@/components/layout/SiteShell";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import AvatarUpload from "@/components/account/AvatarUpload";
import f from "@/components/dashboard/forms.module.css";
import s from "@/components/account/account.module.css";

interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
}

export default function AccountSettingsPage() {
  const { loading: userLoading, user } = useCurrentUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoadError("");
    api
      .get<{ user: Profile }>("/api/users/me")
      .then((d) => {
        setProfile(d.user);
        setName(d.user.name);
        setPhone(d.user.phone ?? "");
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "تعذّر تحميل بياناتك"));
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const payload: Record<string, string> = {};
      if (name.trim() && name.trim() !== profile?.name) payload.name = name.trim();
      if (phone.trim() && phone.trim() !== (profile?.phone ?? "")) payload.phone = phone.trim();

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const res = await api.patch<{ user: Profile }>("/api/users/me", payload);
      setProfile(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "تعذّر حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  const shell = (children: React.ReactNode, narrow = true) => (
    <SiteShell>
      <div className={s.bg} style={uiVars}>
        <main className={narrow ? s.narrow : s.page} style={narrow ? undefined : { maxWidth: t.layout.containerMaxWidth }}>
          {children}
        </main>
      </div>
    </SiteShell>
  );

  if (userLoading) return shell(<div className={s.stateBox}><LoadingState label="جاري التحميل..." /></div>);

  if (!user) {
    return shell(
      <div className={s.state}>
        <p>سجّل دخولك لعرض إعدادات حسابك</p>
        <a href="/login?redirect=/account/settings" className={s.stateLink}>
          تسجيل الدخول
          <ArrowLeft size={15} strokeWidth={2} />
        </a>
      </div>,
    );
  }

  if (loadError) return shell(<ErrorState message={loadError} onRetry={load} />);

  if (!profile) return shell(<div className={s.stateBox}><LoadingState label="جاري التحميل..." /></div>);

  const dirty = name.trim() !== profile.name || phone.trim() !== (profile.phone ?? "");

  return shell(
    <>
      <h1 className={s.title}>إعدادات الحساب</h1>

      <div className={s.card}>
        <AvatarUpload
          currentUrl={profile.avatar}
          name={profile.name}
          onUploaded={(url) => setProfile((p) => (p ? { ...p, avatar: url } : p))}
        />

        <label className={s.field}>
          <span className={f.fieldLabel}>الاسم الكامل</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={f.field} />
        </label>

        <label className={s.field}>
          <span className={f.fieldLabel}>رقم الجوال</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+9665XXXXXXXX" dir="ltr" className={`${f.field} ${f.ltr}`} />
        </label>

        <label className={s.field}>
          <span className={f.fieldLabel}>البريد الإلكتروني</span>
          <input value={profile.email ?? ""} placeholder="لا يوجد بريد مرتبط بحسابك" disabled dir="ltr" className={`${f.field} ${f.ltr}`} />
          <p className={s.hint}>تغيير البريد الإلكتروني غير متاح حالياً — سيُضاف قريباً</p>
        </label>

        {saveError && (
          <p className={s.error} role="alert">
            <AlertTriangle size={15} strokeWidth={1.8} />
            {saveError}
          </p>
        )}
        {saved && (
          <p className={s.ok} role="status">
            <Check size={15} strokeWidth={2.2} />
            تم حفظ التعديلات
          </p>
        )}

        <button type="button" onClick={handleSave} disabled={saving || !dirty} className={`${f.cta} ${s.submit}`}>
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </>,
  );
}
