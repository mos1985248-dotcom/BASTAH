// app/account/settings/page.tsx
// إعدادات الحساب الشخصي — لكل من المشتري والتاجر (بيانات User، لا علاقة
// لها بإعدادات المتجر الموجودة بلوحة التاجر). GET/PATCH /api/users/me،
// رفع الصورة عبر POST /api/uploads/avatar. تعديل البريد مؤجَّل عمداً —
// يحتاج تدفق تحقق حقيقي عبر Supabase قبل اعتماده.
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "@/app/providers";
import { t } from "@/theme";
import SiteShell from "@/components/layout/SiteShell";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import AvatarUpload from "@/components/account/AvatarUpload";

interface Profile {
  id: string;
  name: string;
  email: string;
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

  if (userLoading) {
    return (
      <SiteShell>
        <div style={{ padding: t.spacing["16"] }}><LoadingState label="جاري التحميل..." /></div>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell>
        <div style={{ textAlign: "center", padding: t.spacing["16"] }}>
          <p style={{ color: t.colors.text.mid, marginBottom: t.spacing["3"] }}>سجّلي دخولك لعرض إعدادات حسابك</p>
          <a href="/login?redirect=/account/settings" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
            تسجيل الدخول
            <ArrowLeft size={15} strokeWidth={2} />
          </a>
        </div>
      </SiteShell>
    );
  }

  if (loadError) {
    return (
      <SiteShell>
        <div style={{ padding: t.spacing["8"], maxWidth: 560, margin: "0 auto" }}>
          <ErrorState message={loadError} onRetry={load} />
        </div>
      </SiteShell>
    );
  }

  if (!profile) {
    return (
      <SiteShell>
        <div style={{ padding: t.spacing["16"] }}><LoadingState label="جاري التحميل..." /></div>
      </SiteShell>
    );
  }

  const dirty = name.trim() !== profile.name || phone.trim() !== (profile.phone ?? "");

  return (
    <SiteShell>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: t.spacing["6"] }}>
        <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], margin: `0 0 ${t.spacing["5"]}` }}>
          إعدادات الحساب
        </h1>

        <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["5"], display: "flex", flexDirection: "column", gap: t.spacing["5"] }}>
          <AvatarUpload
            currentUrl={profile.avatar}
            name={profile.name}
            onUploaded={(url) => setProfile((p) => (p ? { ...p, avatar: url } : p))}
          />

          <label style={{ display: "block" }}>
            <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>الاسم الكامل</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 14, boxSizing: "border-box" }}
            />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>رقم الجوال</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+9665XXXXXXXX"
              dir="ltr"
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 14, boxSizing: "border-box" }}
            />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>البريد الإلكتروني</span>
            <input
              value={profile.email}
              disabled
              dir="ltr"
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 14, boxSizing: "border-box", background: t.colors.cream.warm, color: t.colors.text.mid }}
            />
            <p style={{ margin: "6px 0 0", fontSize: 11, color: t.colors.text.light }}>
              تغيير البريد الإلكتروني غير متاح حالياً — سيُضاف قريباً
            </p>
          </label>

          {saveError && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 13, color: t.colors.semantic.danger }}>
              <AlertTriangle size={13} strokeWidth={1.8} />
              {saveError}
            </p>
          )}
          {saved && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 13, color: t.colors.semantic.success }}>
              <Check size={13} strokeWidth={2.2} />
              تم حفظ التعديلات
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{
              padding: 12, borderRadius: t.radius.md, border: "none",
              background: saving ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white,
              fontWeight: t.typography.fontWeight.bold, fontSize: 14,
              cursor: saving || !dirty ? "not-allowed" : "pointer",
              opacity: !dirty ? 0.6 : 1,
            }}
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </SiteShell>
  );
}
