// components/dashboard/CustomDomainCard.tsx
// الدومين المخصص — التاجر يحفظ دومينه هنا فقط بعد أن تفتح الإدارة الميزة له
// (يدوياً، بعد التحقق من اشتراكه 99/199). إن كان الربط الآلي مفعَّلاً بالسيرفر
// (VERCEL_API_TOKEN موجود)، يُضاف الدومين لمشروع Vercel فوراً وتُعرض سجلات
// DNS الحقيقية وحالة الربط الحيّة. بدونه، تظهر تعليمات ثابتة كما كان سابقاً.
// المنطق كما كان حرفياً؛ التغيير في الشكل والصياغة فقط.
"use client";
import { useEffect, useState } from "react";
import { Globe, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import DomainStatusPanel from "./DomainStatusPanel";
import type { DomainStatus } from "@/lib/domain-types";
import s from "./forms.module.css";

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

  if (!enabled) {
    return (
      <section className={s.panel} style={uiVars} aria-labelledby="domain-title">
        <div className={s.panelHead}>
          <div className={s.itemLead}>
            <span className={s.itemIcon}><Globe size={17} strokeWidth={1.7} aria-hidden="true" /></span>
            <h2 id="domain-title" className={s.panelTitle}>الدومين المخصص</h2>
          </div>
        </div>
        <div className={s.panelBody}>
          <p className={s.help}>متاح لباقتَي بسطة مارت انطلاق وبسطة مارت ازدهار (99 و199 ر.س). تواصل مع الدعم لتفعيله لمتجرك.</p>
        </div>
      </section>
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
    <section className={s.panel} style={uiVars} aria-labelledby="domain-title">
      <div className={s.panelHead}>
        <div className={s.itemLead}>
          <span className={s.itemIcon} style={{ color: "var(--ui-green)" }}><Globe size={17} strokeWidth={1.7} aria-hidden="true" /></span>
          <h2 id="domain-title" className={s.panelTitle}>الدومين المخصص</h2>
        </div>
      </div>
      <div className={s.panelBody}>
        {automation ? (
          <p className={s.help}>اكتب دومينك واحفظ، وستظهر لك أدناه سجلات DNS المطلوبة وحالة الربط لحظياً.</p>
        ) : (
          <p className={s.help}>
            بعد الحفظ، أضف في لوحة تحكم الدومين لديك سجلّ CNAME باسم <span dir="ltr">www</span> يشير إلى <span dir="ltr">cname.vercel-dns.com</span>، ثم تواصل مع الدعم لإكمال الربط وإصدار الشهادة الأمنية.
          </p>
        )}
        <input
          className={`${s.field} ${s.ltr}`}
          value={value}
          onChange={(e) => { setValue(e.target.value); setSaved(false); }}
          placeholder="mystore.com"
          dir="ltr"
          aria-label="الدومين المخصص"
        />
        {error && (
          <p className={s.err} role="alert">
            <AlertTriangle size={13} strokeWidth={1.8} aria-hidden="true" />
            {error}
          </p>
        )}
        {saved && !automation && (
          <p className={s.ok} role="status">
            <CheckCircle2 size={14} strokeWidth={1.8} aria-hidden="true" />
            تم الحفظ
          </p>
        )}
        <button type="button" className={s.cta} onClick={save} disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ الدومين"}
        </button>
        {automation && value.trim() && <DomainStatusPanel status={status} checking={checking} onCheck={check} />}
      </div>
    </section>
  );
}
