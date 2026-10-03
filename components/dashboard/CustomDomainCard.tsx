// components/dashboard/CustomDomainCard.tsx
// الدومين المخصص — التاجر يحفظ دومينه هنا فقط بعد أن تفتح الإدارة الميزة له
// (يدوياً، بعد التحقق من اشتراكه 99/199). إن كان الربط الآلي مفعَّلاً بالسيرفر
// (VERCEL_API_TOKEN موجود)، يُضاف الدومين لمشروع Vercel فوراً وتُعرض سجلات
// DNS الحقيقية وحالة الربط الحيّة. بدونه، تظهر تعليمات ثابتة كما كان سابقاً.
"use client";

import { useEffect, useState } from "react";
import { Globe, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import DomainStatusPanel from "./DomainStatusPanel";
import type { DomainStatus } from "@/lib/domain-types";

interface DomainResponse { customDomain: string | null; automation: boolean; status: DomainStatus | null }

export default function CustomDomainCard({
  enabled, currentDomain, onSaved,
}: { enabled: boolean; currentDomain: string | null; onSaved: (domain: string | null) => void }) {
  const [value, setValue] = useState(currentDomain ?? "");
  const [automation, setAutomation] = useState(false);
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    api.get<DomainResponse>("/api/stores/domain")
      .then((r) => { setAutomation(r.automation); setStatus(r.status); })
      .catch(() => {}); // الحفظ اليدوي بالنموذج يبقى متاحاً حتى لو تعذّرت القراءة الأولى
  }, [enabled]);

  const card = { background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["5"], marginTop: t.spacing["5"] };

  if (!enabled) {
    return (
      <div style={card}>
        <p style={{ display: "flex", alignItems: "center", gap: 7, margin: 0, fontSize: 14, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
          <Globe size={16} strokeWidth={1.8} />
          الدومين المخصص
        </p>
        <p style={{ margin: `${t.spacing["2"]} 0 0`, fontSize: 12, color: t.colors.text.mid }}>
          متاح لباقتَي بسطة انطلاق وبسطة ازدهار (99 و199 ر.س). تواصلي مع الدعم لتفعيله لمتجرك.
        </p>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const domain = value.trim() || null;
      const res = await api.patch<{ store: { customDomain: string | null }; automation: boolean; status: DomainStatus | null }>(
        "/api/stores/domain", { customDomain: domain }
      );
      onSaved(res.store.customDomain);
      setAutomation(res.automation);
      setStatus(res.status);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ الدومين");
    } finally {
      setSaving(false);
    }
  };

  const check = async () => {
    setChecking(true);
    try {
      const res = await api.get<DomainResponse>("/api/stores/domain?verify=1");
      setStatus(res.status);
    } catch {
      /* الزر يبقى متاحاً لإعادة المحاولة */
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={card}>
      <p style={{ display: "flex", alignItems: "center", gap: 7, margin: 0, fontSize: 14, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
        <Globe size={16} strokeWidth={1.8} />
        الدومين المخصص
      </p>

      {automation ? (
        <p style={{ margin: `${t.spacing["2"]} 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>
          اكتبي دومينك واحفظي، وستظهر لك أدناه سجلات DNS المطلوبة وحالة الربط لحظياً.
        </p>
      ) : (
        <p style={{ margin: `${t.spacing["2"]} 0 ${t.spacing["3"]}`, fontSize: 12, color: t.colors.text.mid }}>
          بعد الحفظ، أضيفي في لوحة تحكم الدومين لديك سجلّ CNAME باسم <span dir="ltr">www</span> يشير إلى <span dir="ltr">cname.vercel-dns.com</span>، ثم تواصلي مع الدعم لإكمال الربط وإصدار الشهادة الأمنية.
        </p>
      )}

      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        placeholder="mystore.com"
        dir="ltr"
        style={{ width: "100%", padding: 11, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 14, boxSizing: "border-box", textAlign: "left" }}
      />
      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `${t.spacing["2"]} 0 0`, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={13} strokeWidth={1.8} />
          {error}
        </p>
      )}
      {saved && !automation && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `${t.spacing["2"]} 0 0`, fontSize: 12, color: t.colors.semantic.success }}>
          <CheckCircle2 size={13} strokeWidth={1.8} />
          تم الحفظ
        </p>
      )}
      <button
        onClick={save}
        disabled={saving}
        style={{ marginTop: t.spacing["3"], width: "100%", padding: 11, background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: 13, fontWeight: t.typography.fontWeight.bold, cursor: saving ? "not-allowed" : "pointer" }}
      >
        {saving ? "جاري الحفظ..." : "حفظ الدومين"}
      </button>

      {automation && value.trim() && <DomainStatusPanel status={status} checking={checking} onCheck={check} />}
    </div>
  );
}
