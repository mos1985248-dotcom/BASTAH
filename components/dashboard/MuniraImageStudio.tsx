"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api-client";
import { imageKinds, imageSizes } from "@/lib/munira/image-options";
import { uiVars } from "@/components/ui/vars";
import f from "./forms.module.css";
import s from "./munira-studio.module.css";

type Quota = { allowed: boolean; limit: number; used: number; remaining: number; resetAt: string };
type Studio = {
  quota: Quota; requiredPlan: string | null; enabled: boolean; images: { id: string; createdAt: string; saved: boolean }[];
};
const endpoint = "/api/ai/images";
const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", dateStyle: "medium" });

export default function MuniraImageStudio({ initialPrompt = "", onUse, storeSlug, close }: {
  initialPrompt?: string; onUse?: (file: File) => void | Promise<void>; storeSlug?: string; close?: () => void;
}) {
  const [state, setState] = useState<Studio | null>(null);
  const [prompt, setPrompt] = useState(initialPrompt.slice(0, 800));
  const [kind, setKind] = useState<keyof typeof imageKinds>("product");
  const [size, setSize] = useState<keyof typeof imageSizes>("square");
  const [current, setCurrent] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const ticket = useRef<{ hash: string; id: string }>();
  const load = async () => setState(await api.get<Studio>(endpoint));
  useEffect(() => { load().catch(() => setError("تعذّر تحميل استوديو منيرة.")); }, []);

  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try { await action(); }
    catch (error) { setError(error instanceof Error ? error.message : "حدث خطأ أثناء معالجة الصورة."); }
    finally { setBusy(false); }
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await perform(async () => {
      const hash = JSON.stringify([prompt, kind, size]);
      const requestId = ticket.current?.hash === hash ? ticket.current.id : crypto.randomUUID();
      ticket.current = { hash, id: requestId };
      try {
        const result = await api.post<{ id: string; quota: Quota }>(endpoint, { requestId, prompt, kind, size });
        setCurrent(result.id);
        setState(previous => previous && { ...previous, quota: result.quota });
        ticket.current = undefined;
        await load();
      } catch (error) {
        if (error instanceof Error && "status" in error) ticket.current = undefined;
        throw error;
      }
    });
  }

  async function useImage() {
    if (!current) return;
    await perform(async () => {
      const response = await fetch(`${endpoint}/${current}`, { cache: "no-store" });
      if (!response.ok) throw new Error("تعذّر جلب الصورة.");
      const file = new File([await response.blob()], `munira-${current}.webp`, { type: "image/webp" });
      if (onUse) {
        await onUse(file);
        close?.();
      } else if (storeSlug) {
        const body = new FormData();
        body.set("slug", storeSlug);
        body.set("field", "cover");
        body.set("file", file);
        const result = await fetch("/api/uploads/store", { method: "POST", body });
        if (!result.ok) throw new Error("تعذّر تحديث غلاف المتجر.");
        setNotice("تم تحديث غلاف المتجر.");
      }
    });
  }

  return <section className={s.studio} dir="rtl" style={uiVars}>
    <header><h2>استوديو منيرة</h2><p>حوّل أفكارك إلى صور تسويقية تساعدك في إبراز منتجاتك.</p></header>
    {error && <p role="alert" className={f.err}>{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {!state && !error && <p role="status">جارٍ تحميل الاستوديو…</p>}
    {state && <>
      <section className={s.quota} aria-label="حصة الصور">
        <strong>الصور</strong>
        <span dir="auto">{state.quota.used} من {state.quota.limit} · متبقي {state.quota.remaining}</span>
        {state.quota.limit > 0 && <progress aria-label="استهلاك حصة الصور" max={state.quota.limit} value={Math.min(state.quota.used, state.quota.limit)} />}
        {state.quota.allowed && <small>تجدد الحصة {date.format(new Date(state.quota.resetAt))} بتوقيت الرياض</small>}
      </section>
      {!state.quota.allowed ? <p>توليد الصور مقفل. {state.requiredPlan && `متاح من باقة ${state.requiredPlan}. `}<Link href="/dashboard/subscription">ترقية الباقة</Link></p>
      : !state.enabled ? <p role="status">استوديو منيرة متوقف مؤقتًا.</p>
      : state.quota.remaining === 0 ? <p role="status">استُهلكت حصة الصور حتى موعد التجدد.</p>
      : <form onSubmit={generate} className={s.fields}>
        <label className={f.fieldWrap}><span className={f.fieldLabel}>وصف الصورة</span>
          <textarea className={f.field} rows={4} value={prompt} minLength={3} maxLength={800} onChange={event => setPrompt(event.target.value)} required />
        </label>
        <div className={s.options}>
          <label className={f.fieldWrap}><span className={f.fieldLabel}>نوع الصورة</span>
            <select className={f.field} value={kind} onChange={event => setKind(event.target.value as typeof kind)}>
              {Object.entries(imageKinds).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label className={f.fieldWrap}><span className={f.fieldLabel}>المقاس</span>
            <select className={f.field} value={size} onChange={event => setSize(event.target.value as typeof size)}>
              {Object.entries(imageSizes).map(([key, option]) => <option key={key} value={key}>{option.label}</option>)}
            </select>
          </label>
        </div>
        <p>استخدم الصور التي تعكس المنتج الحقيقي، وتجنّب المعلومات الشخصية أو المضللة.</p>
        <button type="submit" className={f.cta} disabled={busy}>{busy ? "جارٍ المعالجة…" : current ? "إنشاء صورة أخرى" : "إنشاء الصورة"}</button>
      </form>}
      {current && <section className={s.preview} aria-label="معاينة الصورة">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${endpoint}/${current}`} alt="الصورة التي أنشأتها منيرة" />
        <div className={s.actions}>
          <a href={`${endpoint}/${current}?download=1`} className={f.btnSm}>تحميل الصورة</a>
          <button type="button" className={f.btnSm} disabled={busy || state.images.some(item => item.id === current && item.saved)}
            onClick={() => perform(async () => { await api.patch(`${endpoint}/${current}`); await load(); setNotice("حُفظت الصورة في مكتبتك."); })}>حفظ في مكتبة الصور</button>
          {(onUse || storeSlug) && <button type="button" className={f.btnSm} disabled={busy}
            onClick={() => { if (onUse || window.confirm("هل تريد استخدام هذه الصورة غلافًا لمتجرك؟")) void useImage(); }}>
            {onUse ? "استخدام الصورة في المنتج" : "استخدام الصورة غلافًا للمتجر"}
          </button>}
        </div>
      </section>}
      <section><h3>صوري</h3>
        {state.images.some(image => !image.saved) && <p>تظهر الصور التي لم تحفظها بعد بعلامة «مسودة».</p>}
        {state.images.length ? <ul className={s.gallery}>{state.images.map(image => <li key={image.id}>
          <button type="button" onClick={() => setCurrent(image.id)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${endpoint}/${image.id}`} loading="lazy" alt="معاينة الصورة المحفوظة" />
          </button>
          {!image.saved && <small>مسودة</small>}
          <time dateTime={image.createdAt}>{date.format(new Date(image.createdAt))}</time>
          <button type="button" className={f.btnSm} disabled={busy} onClick={() => {
            if (window.confirm("حذف الصورة من مكتبتك؟")) void perform(async () => {
              await api.delete(`${endpoint}/${image.id}`);
              if (current === image.id) setCurrent(null);
              await load();
            });
          }}>حذف</button>
        </li>)}</ul> : <p>لا توجد صور محفوظة بعد.</p>}
      </section>
    </>}
  </section>;
}

export function MuniraImageButton({ prompt, onUse, disabled }: {
  prompt: string; onUse: (file: File) => void | Promise<void>; disabled?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className={f.btnSm} disabled={disabled} onClick={() => { setOpen(true); dialog.current?.showModal(); }}>أنشئ صورة مع منيرة</button>
    <dialog className={s.dialog} ref={dialog} onClose={() => setOpen(false)} aria-label="استوديو منيرة" style={uiVars}>
      <button type="button" className={f.btnSm} onClick={() => dialog.current?.close()}>إغلاق</button>
      {open && <MuniraImageStudio initialPrompt={prompt} onUse={onUse} close={() => dialog.current?.close()} />}
    </dialog>
  </>;
}
