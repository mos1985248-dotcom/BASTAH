"use client";

import { useCallback, useEffect, useState } from "react";
import MuniraKnowledge from "./MuniraKnowledge";
import MuniraImageProviders from "./MuniraImageProviders";
import { api, ApiError } from "@/lib/api-client";
import s from "@/components/dashboard/forms.module.css";

type Model = {
  id: string; provider: string; model: string; priority: number; enabled: boolean;
  freeVerified: boolean; lastCheckedAt: string | null; lastError: string | null; requests: number; tokens: number;
};
type Config = { models: Model[]; paidBudgetUsd: number; plans: { nameAr: string; muniraMonthlyMessages: number; muniraTrialMessages: number }[] };

const providerNames: Record<string, string> = { openrouter: "OpenRouter", gemini: "Google Gemini", groq: "Groq" };
const errorNames: Record<string, string> = {
  BILLING_UNVERIFIED: "تعذّر إثبات أن حساب المزود مجاني",
  MODEL_NOT_FREE: "النموذج غير مجاني أو تسعيره غير مؤكد",
  INVALID_MODEL: "معرّف النموذج غير متاح",
  OPENROUTER_KEY_MISSING: "مفتاح OpenRouter مفقود في إعدادات الخادم",
  GROQ_KEY_MISSING: "مفتاح Groq مفقود في إعدادات الخادم",
  HTTP_429: "تجاوز المزود الحد المجاني",
  HTTP_401: "المفتاح غير صالح",
  HTTP_403: "المفتاح لا يملك الصلاحية",
  EMPTY_RESPONSE: "ردّ فارغ",
  COST_UNVERIFIED: "لم يؤكد المزود أن الطلب انتهى بتكلفة صفرية",
  NONZERO_COST: "أفاد المزوّد بتكلفة غير صفرية",
};

export default function MuniraProviders() {
  const [tab, setTab] = useState<"chat" | "images" | "knowledge">("chat");
  return <>
    <nav aria-label="مزودات منيرة" className={s.itemActions}>
      <button type="button" className={s.btnSm} aria-pressed={tab === "chat"} onClick={() => setTab("chat")}>نماذج المحادثات</button>
      <button type="button" className={s.btnSm} aria-pressed={tab === "images"} onClick={() => setTab("images")}>نماذج توليد الصور</button>
      <button type="button" className={s.btnSm} aria-pressed={tab === "knowledge"} onClick={() => setTab("knowledge")}>معرفة منيرة</button>
    </nav>
    {tab === "knowledge" ? <MuniraKnowledge /> : tab === "images" ? <MuniraImageProviders /> : <ChatProviders />}
  </>;
}

function ChatProviders() {
  const [config, setConfig] = useState<Config | null>(null);
  const [provider, setProvider] = useState("openrouter");
  const [model, setModel] = useState("");
  const [key, setKey] = useState("");
  const [priority, setPriority] = useState(100);
  const [priorities, setPriorities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const data = await api.get<Config>("/api/admin/munira");
    setConfig(data);
  }, []);
  useEffect(() => { void load().catch(() => setMessage("تعذّر تحميل مزودات منيرة.")); }, [load]);

  async function run(operation: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setMessage("");
    try {
      const result = await operation();
      await load();
      setMessage(result.ok ? "تم تحديث مزودات منيرة." : (errorNames[result.error ?? ""] ?? "تعذّر التحقق من المزود."));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذّر حفظ التغييرات.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={s.panel} dir="rtl" aria-labelledby="munira-providers">
      <div className={s.panelHead}><h2 className={s.panelTitle} id="munira-providers">مزودات منيرة</h2></div>
      <div className={s.panelBody}>
        <p>ميزانية الاستخدام المدفوع: {config?.paidBudgetUsd ?? 0} دولار.</p>
        <form className={s.two} onSubmit={event => {
          event.preventDefault();
          void run(async () => {
            const result = await api.post<{ ok: boolean }>("/api/admin/munira", { provider, model, apiKey: provider === "groq" || !key ? undefined : key, priority });
            setKey("");
            return result;
          });
        }}>
          <label className={s.fieldWrap}>المزود<select className={s.field} value={provider} onChange={e => setProvider(e.target.value)}>
            {Object.entries(providerNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select></label>
          <label className={s.fieldWrap}>معرّف النموذج<input className={s.field} dir="ltr" required value={model} onChange={e => setModel(e.target.value)} /></label>
          {provider === "groq" ? <p>يستخدم Groq المفتاح المحفوظ في إعدادات الخادم.</p> : <label className={s.fieldWrap}>مفتاح API {provider === "openrouter" ? "(اتركه فارغًا لاستخدام مفتاح الخادم)" : ""}<input className={s.field} dir="ltr" type="password" autoComplete="new-password" required={provider === "gemini"} value={key} onChange={e => setKey(e.target.value)} /></label>}
          <label className={s.fieldWrap}>الأولوية (الأصغر أولاً)<input className={s.field} type="number" min={1} max={1000} required value={priority} onChange={e => setPriority(Number(e.target.value))} /></label>
          <button className={s.cta} disabled={busy}>حفظ النموذج أو استبدال المفتاح</button>
        </form>
        {message && <p role="status">{message}</p>}
        {config?.models.map(item => (
          <article key={item.id} className={s.panel}>
            <div className={s.panelBody}>
              <h3>{providerNames[item.provider] ?? item.provider} <bdi>{item.model}</bdi></h3>
              <p>{item.enabled ? "مفعّل" : "متوقف"} · {item.provider === "groq" && item.enabled ? "خطة Free بتأكيد المالك" : item.freeVerified ? "مجاني متحقق منه" : "المجانية غير مؤكدة"} · {item.lastCheckedAt ? (item.lastError ? "تعذّر الاتصال أو التحقق" : "الاتصال متاح") : "لم يُختبر الاتصال"}</p>
              <p>{item.requests} طلب · {item.tokens} توكن</p>
              {item.lastError && <p>آخر خطأ: {errorNames[item.lastError] ?? item.lastError}</p>}
              <label className={s.fieldWrap}>الأولوية<input className={s.field} type="number" min={1} max={1000} value={priorities[item.id] ?? item.priority} onChange={e => setPriorities(prev => ({ ...prev, [item.id]: Number(e.target.value) }))} /></label>
              <div className={s.actions}>
                <button type="button" className={s.cta} disabled={busy} onClick={() => void run(() => api.patch("/api/admin/munira", { id: item.id, action: "test" }))}>اختبار الاتصال</button>
                <button type="button" className={`${s.cta} ${s.ghost}`} disabled={busy} onClick={() => void run(() => api.patch("/api/admin/munira", { id: item.id, action: item.enabled ? "disable" : "enable" }))}>{item.enabled ? "إيقاف" : "تفعيل"}</button>
                <button type="button" className={`${s.cta} ${s.ghost}`} disabled={busy} onClick={() => void run(() => api.patch("/api/admin/munira", { id: item.id, action: "priority", priority: priorities[item.id] ?? item.priority }))}>حفظ الأولوية</button>
              </div>
            </div>
          </article>
        ))}
        {config?.plans.map(plan => <p key={plan.nameAr}>{plan.nameAr}: {plan.muniraTrialMessages > 0 ? `${plan.muniraTrialMessages} رسائل تجريبية مرة واحدة` : `${plan.muniraMonthlyMessages} رسالة شهريًا`}</p>)}
      </div>
    </section>
  );
}
