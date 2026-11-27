"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api-client";
import { imageKinds, imagePresets, imageSizes, isImagePreset, type ImagePreset } from "@/lib/munira/image-options";
import { productImageTemplates } from "@/lib/munira/image-templates";
import { uiVars } from "@/components/ui/vars";
import f from "./forms.module.css";
import s from "./munira-studio.module.css";

type Quota = { allowed: boolean; limit: number; used: number; remaining: number; resetAt: string };
type Studio = {
  quota: Quota; requiredPlan: string | null; enabled: boolean; images: { id: string; createdAt: string; saved: boolean; canRevise: boolean; feedbackStatus: string | null; feedbackNote: string | null }[];
};
const BastahModal = dynamic(() => import("@/components/ui/BastahModal"), { ssr: false });
const endpoint = "/api/ai/images";
const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", dateStyle: "medium" });

export default function MuniraImageStudio({ initialPrompt = "", onUse, storeSlug, close }: {
  initialPrompt?: string; onUse?: (file: File) => void | Promise<void>; storeSlug?: string; close?: () => void;
}) {
  const [state, setState] = useState<Studio | null>(null);
  const [prompt, setPrompt] = useState(initialPrompt.slice(0, 800));
  const [kind, setKind] = useState<keyof typeof imageKinds | ImagePreset>("product");
  const [size, setSize] = useState<keyof typeof imageSizes>("square");
  const preset = isImagePreset(kind) ? imagePresets[kind] : null;
  const [current, setCurrent] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [feedbackMode, setFeedbackMode] = useState<"MATCHED" | "NEEDS_EDIT" | null>(null);
  const revisionTicket = useRef<{ key: string; requestId: string }>();
  const selectedImage = state?.images.find(item => item.id === current);
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
        selectImage(result.id);
        setState(previous => previous && { ...previous, quota: result.quota });
        ticket.current = undefined;
        await load();
      } catch (error) {
        if (error instanceof Error && "status" in error) ticket.current = undefined;
        throw error;
      }
    });
  }

  function selectImage(id: string | null) {
    setCurrent(id);
    setFeedbackMode(null);
    setFeedbackDraft("");
  }

  async function submitFeedback(regenerate: boolean) {
    if (!current || !feedbackMode) return;
    const feedbackUrl = `${endpoint}/${current}/feedback`;
    await perform(async () => {
      if (!regenerate) {
        await api.patch(feedbackUrl, { status: feedbackMode, note: feedbackDraft });
        await load();
        setFeedbackMode(null);
        setNotice("حُفظ تقييم الصورة.");
        return;
      }
      const reason = feedbackDraft.trim();
      const key = JSON.stringify([current, reason]);
      const requestId = revisionTicket.current?.key === key ? revisionTicket.current.requestId : crypto.randomUUID();
      revisionTicket.current = { key, requestId };
      try {
        const result = await api.post<{ id: string; quota: Quota }>(feedbackUrl, { requestId, reason });
        revisionTicket.current = undefined;
        selectImage(result.id);
        setState(previous => previous && { ...previous, quota: result.quota });
        await load();
      } catch (error) {
        if (error instanceof Error && "status" in error) revisionTicket.current = undefined;
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
        <div>
          <strong>قوالب تصوير المنتجات</strong>
          <div className={s.actions} aria-label="قوالب تصوير المنتجات">
            {productImageTemplates.map(template => <button key={template.id} type="button" className={f.btnSm}
              disabled={busy} onClick={() => { setPrompt(template.prompt); setKind("product"); }}>{template.label}</button>)}
          </div>
        </div>
        <label className={f.fieldWrap}><span className={f.fieldLabel}>وصف الصورة</span>
          <textarea className={f.field} rows={4} value={prompt} minLength={3} maxLength={800} onChange={event => setPrompt(event.target.value)} required />
        </label>
        <div className={s.options}>
          <label className={f.fieldWrap}><span className={f.fieldLabel}>نوع الصورة</span>
            <select className={f.field} value={kind} onChange={event => setKind(event.target.value as typeof kind)}>
              {Object.entries(imagePresets).map(([key, option]) => <option key={key} value={key}>{option.label}</option>)}
              {Object.entries(imageKinds).filter(([key]) => key !== "product" && key !== "cover").map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <label className={f.fieldWrap}><span className={f.fieldLabel}>المقاس</span>
            {preset ? <output className={s.fixedSize} dir="ltr">{preset.width} × {preset.height}</output> : <select className={f.field} value={size} onChange={event => setSize(event.target.value as typeof size)}>
              {Object.entries(imageSizes).map(([key, option]) => <option key={key} value={key}>{option.label}</option>)}
            </select>}
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
        <div className={s.fields} aria-label="تقييم الصورة">
          {selectedImage?.feedbackStatus && <small>
            التقييم {selectedImage.feedbackStatus === "MATCHED" ? "مطابقة" : "تحتاج تعديل"}
          </small>}
          <div className={s.actions}>
            <button type="button" className={f.btnSm} disabled={busy} onClick={() => {
              setFeedbackMode("MATCHED");
              setFeedbackDraft(selectedImage?.feedbackStatus === "MATCHED" ? selectedImage.feedbackNote ?? "" : "");
            }}>مطابقة</button>
            <button type="button" className={f.btnSm} disabled={busy} onClick={() => {
              setFeedbackMode("NEEDS_EDIT");
              setFeedbackDraft(selectedImage?.feedbackStatus === "NEEDS_EDIT" ? selectedImage.feedbackNote ?? "" : "");
            }}>تحتاج تعديل</button>
          </div>
          {feedbackMode && <>
            <label className={f.fieldWrap}><span className={f.fieldLabel}>
              {feedbackMode === "MATCHED" ? "ما أعجبك في الصورة؟ اختياري، يُستخدم في طلبات متجرك" : "ما الذي تريد تعديله؟"}
            </span><textarea className={f.field} rows={2} maxLength={240} value={feedbackDraft}
              onChange={event => setFeedbackDraft(event.target.value)} disabled={busy} /></label>
            <div className={s.actions}>
              <button type="button" className={f.btnSm} disabled={busy || (feedbackMode === "NEEDS_EDIT" && feedbackDraft.trim().length < 3)}
                onClick={() => void submitFeedback(false)}>حفظ التقييم</button>
              {feedbackMode === "NEEDS_EDIT" && selectedImage?.canRevise && state.enabled && state.quota.allowed && state.quota.remaining > 0 &&
                <button type="button" className={f.btnSm} disabled={busy || feedbackDraft.trim().length < 3}
                  onClick={() => void submitFeedback(true)}>إعادة التوليد بالتعديل</button>}
            </div>
          </>}
        </div>
      </section>}
      <section><h3>صوري</h3>
        {state.images.some(image => !image.saved) && <p>تظهر الصور التي لم تحفظها بعد بعلامة «مسودة».</p>}
        {state.images.length ? <ul className={s.gallery}>{state.images.map(image => <li key={image.id}>
          <button type="button" onClick={() => selectImage(image.id)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${endpoint}/${image.id}`} loading="lazy" alt="معاينة الصورة المحفوظة" />
          </button>
          {!image.saved && <small>مسودة</small>}
          <time dateTime={image.createdAt}>{date.format(new Date(image.createdAt))}</time>
          <button type="button" className={f.btnSm} disabled={busy} onClick={() => {
            if (window.confirm("حذف الصورة من مكتبتك؟")) void perform(async () => {
              await api.delete(`${endpoint}/${image.id}`);
              if (current === image.id) selectImage(null);
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
  const [open, setOpen] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);
  const close = () => setOpen(false);

  return <>
    <button type="button" className={f.btnSm} disabled={disabled} aria-haspopup="dialog" onClick={() => {
      setOpenedOnce(true);
      setOpen(true);
    }}>أنشئ صورة مع منيرة</button>
    {openedOnce && <BastahModal open={open} label="استوديو منيرة" onClose={close}>
      <MuniraImageStudio initialPrompt={prompt} onUse={onUse} close={close} />
    </BastahModal>}
  </>;
}
