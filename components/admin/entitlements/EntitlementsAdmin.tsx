"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api-client";
import s from "@/components/dashboard/marketing/marketing.module.css";

type Rule = { plan: string; enabled: boolean; limit: number | null };
type Feature = { key: string; label: string; enabled: boolean; rules: Rule[] };
type Snapshot = {
  matrix: Feature[]; plans: { plan: string; nameAr: string }[];
  changes: { id: string; action: string; actorId: string; createdAt: string; details: unknown }[];
  promotions: { seat: number; storeId: string; startsAt: string; endsAt: string }[];
  capacity: number;
  decisions: { key: string; allowed: boolean; reason: string }[] | null;
};

export default function EntitlementsAdmin() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [storeId, setStoreId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(store?: string) {
    try {
      const query = store ? `?storeId=${encodeURIComponent(store)}` : "";
      setData(await api.get<Snapshot>(`/api/admin/entitlements${query}`));
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذّر التحميل"); }
  }
  useEffect(() => { void load(); }, []);

  async function save(body: object) {
    setBusy(true);
    setMessage("");
    try {
      await api.post("/api/admin/entitlements", body);
      await load(storeId);
      setMessage("تم الحفظ");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذّر الحفظ"); }
    finally { setBusy(false); }
  }

  function submitOverride(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const start = String(fields.get("startsAt"));
    const end = String(fields.get("endsAt"));
    const limit = String(fields.get("limit"));
    void save({ action: "override", storeId, key: fields.get("key"), enabled: fields.get("allowed") === "on",
      limit: limit === "" ? null : Number(limit), startsAt: new Date(start).toISOString(), endsAt: end ? new Date(end).toISOString() : null });
  }

  function edit(feature: Feature) {
    setData(prev => prev && { ...prev, matrix: prev.matrix.map(row => row.key === feature.key ? feature : row) });
  }

  return (
    <section className={s.stack} dir="rtl">
      <h1 className={s.h2}>إدارة المميزات والصلاحيات</h1>
      {message && <p role="status">{message}</p>}
      {!data ? <p>جارٍ التحميل…</p> : <>
        <div className={s.tableBox}>
          <table className={s.table}>
            <thead><tr><th>الميزة</th><th>مفعّلة في المنصة</th>{data.plans.map(plan => <th key={plan.plan}>{plan.nameAr}</th>)}<th>الحفظ</th></tr></thead>
            <tbody>{data.matrix.map(row => <tr key={row.key}>
              <th>{row.label}</th>
              <td><input aria-label={`تفعيل ${row.label} في المنصة`} type="checkbox" checked={row.enabled} onChange={event => edit({ ...row, enabled: event.target.checked })} /></td>
              {row.rules.map(rule => <td key={rule.plan}>
                <input aria-label={`تفعيل ${row.label} في ${rule.plan}`} type="checkbox" checked={rule.enabled}
                  onChange={event => edit({ ...row, rules: row.rules.map(item => item.plan === rule.plan ? { ...item, enabled: event.target.checked } : item) })} />
                <input aria-label={`حد ${row.label} في ${rule.plan}`} type="number" min={0} max={1000000} value={rule.limit ?? ""} placeholder="بلا حد"
                  onChange={event => edit({ ...row, rules: row.rules.map(item => item.plan === rule.plan ? { ...item, limit: event.target.value === "" ? null : Number(event.target.value) } : item) })} />
              </td>)}
              <td><button type="button" disabled={busy} onClick={() => save({ action: "feature", ...row })}>حفظ</button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <form className={s.sec} onSubmit={event => {
          event.preventDefault();
          const fields = new FormData(event.currentTarget);
          void save({ action: "feature", key: fields.get("key"), label: fields.get("label"), enabled: false, rules: [] });
        }}>
          <h2 className={s.h2}>إضافة ميزة</h2>
          <label>المعرّف الثابت <input name="key" required pattern="[a-z][a-z0-9_]{1,47}" dir="ltr" /></label>
          <label>الاسم <input name="label" required maxLength={100} /></label>
          <button disabled={busy}>إضافة</button>
        </form>
        <div className={s.sec}>
          <label>معرف المتجر <input value={storeId} onChange={event => setStoreId(event.target.value.trim())} dir="ltr" /></label>
          <button type="button" disabled={!storeId || busy} onClick={() => load(storeId)}>استعراض الصلاحيات</button>
          {data.decisions && <ul>{data.decisions.map(decision => <li key={decision.key}>
            {data.matrix.find(row => row.key === decision.key)?.label} {decision.allowed ? "متاحة" : "مقفلة"}
            {" · "}{({ inactive_subscription: "اشتراك غير نشط", disabled_on_platform: "إيقاف عام", store_exception: "استثناء متجر", plan: "إعداد الباقة" } as Record<string, string>)[decision.reason]}
          </li>)}</ul>}
          <form onSubmit={submitOverride}>
            <h2 className={s.h2}>استثناء متجر</h2>
            <label>الميزة <select name="key">{data.matrix.map(row => <option key={row.key} value={row.key}>{row.label}</option>)}</select></label>
            <label>سماح <input type="checkbox" name="allowed" defaultChecked /></label>
            <label>الحد <input type="number" name="limit" min={0} max={1000000} /></label>
            <label>البداية <input type="datetime-local" name="startsAt" required /></label>
            <label>النهاية <input type="datetime-local" name="endsAt" /></label>
            <button disabled={!storeId || busy}>حفظ الاستثناء</button>
          </form>
        </div>
        <div className={s.sec}>
          <h2 className={s.h2}>عرض انطلاق لأول 50 تاجرًا</h2>
          <p>{data.promotions.length} مستفيد · {data.capacity - data.promotions.length} مقعد متبقٍ</p>
          <button type="button" disabled={!storeId || busy || data.promotions.length >= data.capacity} onClick={() => save({ action: "promotion", storeId })}>منح العرض للمتجر المحدد</button>
          <ul>{data.promotions.map(promo => <li key={promo.seat}>{promo.storeId} · {new Date(promo.startsAt).toLocaleDateString("ar-SA-u-ca-gregory")} – {new Date(promo.endsAt).toLocaleDateString("ar-SA-u-ca-gregory")} · {Date.parse(promo.endsAt) > Date.now() ? "نشط" : "منتهٍ"}</li>)}</ul>
        </div>
        <div className={s.sec}>
          <h2 className={s.h2}>سجل التغييرات</h2>
          {data.changes.map(change => <details key={change.id}>
            <summary>{change.action} · {new Date(change.createdAt).toLocaleString("ar-SA-u-ca-gregory")} · {change.actorId}</summary>
            <pre style={{ overflow: "auto" }} dir="ltr">{JSON.stringify(change.details, null, 2)}</pre>
          </details>)}
        </div>
      </>}
    </section>
  );
}
