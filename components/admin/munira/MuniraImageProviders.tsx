"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import f from "@/components/dashboard/forms.module.css";
import s from "@/components/dashboard/munira-studio.module.css";

type Model = { provider: string; model: string; enabled: boolean; priority: number };
type Settings = { enabled: boolean; models: Model[] };
type Check = { checkedAt: string; code: string; httpStatus?: number; providerCodes?: number[];
  evidence?: { subscriptions: number; workersRows: number; freeActive: number; contradictory: number } };
const diagnosticText: Record<string, string> = {
  VERIFIED_FREE: "تم التحقق من خطة Workers المجانية.",
  KEYS_MISSING: "إعدادات Cloudflare غير مكتملة في هذه البيئة.",
  ACCOUNT_INVALID: "صيغة معرف حساب Cloudflare غير صحيحة.",
  BILLING_AUTH_REJECTED: "مفتاح Cloudflare نشط، لكن مسار الاشتراكات رفضه. راجع نوع المفتاح ونطاق Billing Read للحساب.",
  TOKEN_UNVERIFIED: "رفض مسار الاشتراكات المصادقة، وتعذّر تأكيد حالة المفتاح من مساري التحقق.",
  AUTH_INVALID: "رفض Cloudflare المصادقة. قد يكون المفتاح غير صالح أو منتهيًا.",
  PERMISSION_DENIED: "رفض Cloudflare الوصول. تحقّق من صلاحية Billing Read ونطاق الحساب في المفتاح.",
  ACCOUNT_NOT_FOUND: "لم يجد Cloudflare الحساب أو لم يسمح بعرضه لهذا المفتاح.",
  NETWORK_FAILURE: "تعذّر الاتصال بـ Cloudflare أو انتهت المهلة.",
  UNEXPECTED_RESPONSE: "أعاد Cloudflare استجابة غير متوقعة.",
  BILLING_UNVERIFIED: "استجاب Cloudflare، لكن لم تظهر خطة Workers Free نشطة بسعر صفر.",
  BILLING_PAID_OR_AMBIGUOUS: "وجد التحقق خطة مدفوعة أو بيانات فوترة غير حاسمة. التوليد متوقف.",
  HTTP_429: "بلغ الحساب حد الاستخدام أو حد الطلبات لدى Cloudflare.",
  STORAGE_FAILURE: "تولّدت الصورة وتعذّر حفظها في التخزين.",
  GENERATION_FAILED: "تعذّر توليد الصورة.",
};
type Snapshot = {
  settings: Settings;
  plans: { plan: string; nameAr: string; muniraMonthlyImages: number }[];
  today: number; month: number; reserved: number; dayBudget: number; paidBudgetUsd: number;
  stores: { id: string; nameAr: string }[];
  usage: { scope: string; plan: string | null; provider: string; model: string; state: string; _count: number;
    _sum: { estimatedNeurons: number | null; measuredNeurons: number | null } }[];
  cloudflareCheck: Check | null;
  lastFailure: { model: string; error: string | null; createdAt: string } | null;
};
const path = "/api/admin/munira/images";

export default function MuniraImageProviders() {
  const [state, setState] = useState<Snapshot | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState("");
  const [sample, setSample] = useState("");
  const [testPrompt, setTestPrompt] = useState("صورة تسويقية لتمور في عبوة بسيطة على خلفية بيضاء");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const data = await api.get<Snapshot>(path);
    setState(data);
    setSettings(data.settings);
  }
  useEffect(() => { refresh().catch(() => setStatus("تعذّر تحميل إعدادات الصور.")); }, []);

  async function action(body: object, reload = false) {
    setBusy(true);
    setStatus("");
    try {
      const response = await api.post<{ ok: boolean; check?: Check; id?: string }>(path, body);
      if (response.id) setSample(response.id);
      if (response.check) {
        const check = response.check;
        setState(previous => previous && { ...previous, cloudflareCheck: check });
        setStatus(diagnosticText[check.code] ?? "تعذّر التحقق من Cloudflare.");
      } else {
        setStatus(response.ok ? "نجحت العملية." : "تعذّرت العملية.");
      }
      if (reload) await refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "تعذّرت العملية."); }
    finally { setBusy(false); }
  }

  const updateModel = (id: string, update: Partial<Model>) => setSettings(previous => previous && ({
    ...previous, models: previous.models.map(row => row.model === id ? { ...row, ...update } : row),
  }));

  return <div className={s.studio} dir="rtl">
    <h2>نماذج توليد الصور</h2>
    {status && <p role="status">{status}</p>}
    {!state || !settings ? <p>جارٍ التحميل…</p> : <>
      <div className={s.actions}>
        <button type="button" className={f.btnSm} disabled={busy} onClick={() => action({ action: "verify" })}>اختبار الاتصال</button>
        <button type="button" className={f.btnSm} disabled={busy} onClick={() => action({
          action: "settings", settings: { ...settings, enabled: !state.settings.enabled },
        }, true)}>{state.settings.enabled ? "إيقاف التوليد فورًا" : "تفعيل الاستوديو"}</button>
      </div>
      <section className={s.quota} aria-label="حالة الاتصال بـ Cloudflare">
        <strong>حالة الاتصال والخطة</strong>
        {state.cloudflareCheck ? <>
          <p>{diagnosticText[state.cloudflareCheck.code] ?? state.cloudflareCheck.code}</p>
          <small>آخر فحص {new Date(state.cloudflareCheck.checkedAt).toLocaleString("ar-SA-u-ca-gregory", { timeZone: "Asia/Riyadh" })}</small>
          {state.cloudflareCheck.httpStatus && <small dir="ltr">HTTP {state.cloudflareCheck.httpStatus}
            {!!state.cloudflareCheck.providerCodes?.length && ` · ${state.cloudflareCheck.providerCodes.join(", ")}`}
          </small>}
          {state.cloudflareCheck.evidence && <small>
            الاشتراكات المفحوصة {state.cloudflareCheck.evidence.subscriptions} · خطط Workers {state.cloudflareCheck.evidence.workersRows} · أدلة متعارضة {state.cloudflareCheck.evidence.contradictory}
          </small>}
        </> : <p>لم يُسجّل فحص بعد.</p>}
      </section>
      <p>ميزانية مدفوعة {state.paidBudgetUsd} دولار · محجوز {state.reserved} من {state.dayBudget} Neurons خلال آخر 24 ساعة · متبقٍ من سقف بسطة {Math.max(0, state.dayBudget - state.reserved)}.</p>
      <p>صور ناجحة اليوم {state.today} · هذا الشهر {state.month}.</p>
      <label className={f.fieldWrap}><span className={f.fieldLabel}>وصف صورة الاختبار</span>
        <input className={f.field} value={testPrompt} maxLength={800} onChange={event => setTestPrompt(event.target.value)} />
      </label>
      {settings.models.map(row => {
        const entries = state.usage.filter(item => item.provider === row.provider && item.model === row.model);
        const attempts = entries.reduce((sum, item) => sum + item._count, 0);
        const success = entries.filter(item => item.state === "COMPLETE").reduce((sum, item) => sum + item._count, 0);
        const failures = entries.filter(item => item.state === "FAILED").reduce((sum, item) => sum + item._count, 0);
        const estimated = entries.reduce((sum, item) => sum + (item._sum.estimatedNeurons ?? 0), 0);
        return <section className={s.quota} key={row.model}>
          <strong>Cloudflare Workers AI</strong><bdi>{row.model}</bdi>
          <label><input type="checkbox" checked={row.enabled} disabled={busy} onChange={event => updateModel(row.model, { enabled: event.target.checked })} /> مفعّل</label>
          <label>الأولوية <input type="number" min={1} max={1000} value={row.priority} onChange={event => updateModel(row.model, { priority: Number(event.target.value) })} /></label>
          <p>{attempts} محاولة · {success} صورة · {failures} فشل · نسبة النجاح {attempts ? Math.round(success * 100 / attempts) : 0}%</p>
          <p>Neurons المقدّرة للصور الناجحة {estimated}. لا تتوفر قراءة فعلية موثوقة.</p>
          {state.lastFailure?.model === row.model && <p>آخر خطأ <bdi>{diagnosticText[state.lastFailure.error ?? ""] ?? state.lastFailure.error}</bdi></p>}
          <button className={f.btnSm} type="button" disabled={busy || !state.settings.enabled || testPrompt.trim().length < 3} onClick={() => action({
            action: "test", model: row.model, image: { requestId: crypto.randomUUID(), prompt: testPrompt, kind: "product", size: "square" },
          }, true)}>تجربة توليد صورة</button>
        </section>;
      })}
      <button className={f.btnSm} type="button" disabled={busy} onClick={() => action({ action: "settings", settings }, true)}>حفظ إعدادات النماذج</button>
      {sample && <div className={s.preview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${path}/${sample}`} alt="صورة الاختبار المولدة" />
      </div>}
      <h3>حصص الصور الشهرية</h3>
      {state.plans.map(plan => <form key={plan.plan} className={s.actions} onSubmit={event => {
        event.preventDefault();
        const limit = Number(new FormData(event.currentTarget).get("limit"));
        void action({ action: "quota", plan: plan.plan, limit }, true);
      }}>
        <label>{plan.nameAr} <input name="limit" className={f.field} type="number" min={0} max={1000}
          required defaultValue={plan.muniraMonthlyImages} /></label>
        <button type="submit" className={f.btnSm} disabled={busy}>حفظ</button>
      </form>)}
      <h3>الاستخدام حسب المتجر والباقة</h3>
      <ul>{state.usage.filter(item => item.scope.startsWith("store:") && item.state === "COMPLETE").map(item =>
        <li key={`${item.scope}/${item.plan}/${item.model}`}>
          {state.stores.find(store => store.id === item.scope.slice(6))?.nameAr ?? item.scope} · {state.plans.find(plan => plan.plan === item.plan)?.nameAr ?? "—"} · {item._count} صورة
        </li>
      )}</ul>
    </>}
  </div>;
}
