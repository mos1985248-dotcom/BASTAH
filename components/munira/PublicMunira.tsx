"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "@/app/providers";
import { uiVars } from "@/components/ui/vars";
import s from "./public-munira.module.css";

const Modal = dynamic(() => import("@/components/ui/BastahModal"), { ssr: false });
type Mode = "ask" | "draft" | "support";
type Answer = {
  text: string;
  links: { href: string; label: string }[];
  searchProduct?: string;
  previousTopic?: string;
  context?: { topic: "plans"; plan?: "FREE" | "STARTER" | "GROWTH" | "PRO" };
  stores?: { name: string; city: string | null; href: string; products: { name: string; price: number; href: string; available: boolean | null }[] }[];
};
const prices = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" });

function Portrait({ size }: { size: number }) {
  return <Image className={s.portrait} src="/images/munira-avatar.png" alt="" width={size} height={size} />;
}

export default function PublicMunira() {
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<Mode>("ask");
  const [previousProduct, setPreviousProduct] = useState<string>();
  const [previousTopic, setPreviousTopic] = useState<string>();
  const [context, setContext] = useState<Answer["context"]>();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");
  const [consent, setConsent] = useState(false);
  const [ticket, setTicket] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    if (next === "support" && !issue) setIssue(lastQuestion || question);
    if (next !== "support" && next !== mode) {
      setPreviousProduct(undefined);
      setContext(undefined);
      setPreviousTopic(undefined);
      setAnswer(null);
      setQuestion("");
    }
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "support") {
        const result = await api.post<{ ticketNumber: string }>("/api/public/munira/tickets", {
          email: user ? undefined : email.trim(), message: issue, confirm: consent,
        });
        setTicket(result.ticketNumber);
        setConsent(false);
        setIssue("");
      } else {
        setLastQuestion(question);
        const result = await api.post<Answer>("/api/public/munira", {
          message: question, mode, previousProduct: mode === "ask" ? previousProduct : undefined,
          context: mode === "ask" ? context : undefined,
          previousTopic: mode === "ask" ? previousTopic : undefined,
        });
        setPreviousProduct(result.searchProduct);
        setContext(result.context);
        setPreviousTopic(result.previousTopic);
        setAnswer(result);
        setQuestion("");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر الاتصال. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={uiVars}>
      <button id="public-munira-launch" type="button" className={s.launch} aria-haspopup="dialog" onClick={() => { setOpened(true); setOpen(true); }}>
        <MessageCircle size={21} aria-hidden="true" />
        اسأل منيرة
      </button>
      {opened && <Modal open={open} label="اسأل منيرة" onClose={() => setOpen(false)} compactMobile>
        <div className={s.content}>
          <header className={s.profile}>
            <Portrait size={58} />
            <div>
              <h2>منيرة</h2>
              <p>مساعدة بسطة مارت</p>
            </div>
          </header>
          <p className={s.greeting}><span>حياك الله .. معك منيرة، كيف أخدمك اليوم؟</span>{" "}<span>تقدر تختار من الخيارات تحت أو تكتب لي وش بخاطرك.</span></p>
          <div className={s.actions} role="group" aria-label="مساعدة منيرة">
            {([["ask", "دلّيني على بسطة"], ["draft", "ساعديني أفتح بسطتي"], ["support", "وصّليني للدعم"]] as const).map(([value, label]) => (
              <button type="button" key={value} aria-pressed={mode === value} disabled={busy} onClick={() => switchMode(value)}>{label}</button>
            ))}
          </div>
          {mode === "support" && ticket ? (
            <p className={s.answer} role="status">أُرسلت التذكرة إلى فريق الدعم. رقمها <bdi>{ticket}</bdi>.</p>
          ) : (
            <form className={s.form} onSubmit={submit}>
              {mode === "support" ? <>
                {!user && <label>البريد الإلكتروني للرد<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
                <label>وصف المشكلة<textarea required minLength={10} maxLength={1800} rows={3} value={issue} onChange={(event) => setIssue(event.target.value)} /></label>
                <label className={s.confirm}><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />أوافق على إرسال هذه البيانات إلى فريق الدعم.</label>
              </> : <label>
                {mode === "draft" ? "اسم البسطة، وش تبيع، وإيش يميّز شغلك؟" : "سؤالك"}
                <textarea required minLength={2} maxLength={800} rows={3} value={question} onChange={(event) => setQuestion(event.target.value)}
                  placeholder={mode === "ask" ? (previousProduct ? "مثال: طيب في بريدة؟" : "أبغى بسطة في حائل تبيع تمر") : "مثال: تمور القصيم، نبيع التمر السكري ونعبّئه للهدايا"} />
              </label>}
              <button type="submit" className={s.send} disabled={busy}>{busy ? "جارٍ التنفيذ…" : mode === "support" ? "إرسال التذكرة" : "إرسال إلى منيرة"}</button>
            </form>
          )}
          {busy && <p role="status" className={s.status}><Portrait size={26} />{
            mode === "support" ? "أرسل طلبك إلى فريق الدعم…" :
              mode === "draft" ? "أجهّز لك مسودة البايو والحكاية…" :
                "أبحث لك عن إجابة…"
          }</p>}
          {error && <p role="alert" className={s.error}>{error}</p>}
          {answer && mode !== "support" && <div className={s.answer} aria-live="polite">
            <div className={s.reply}><Portrait size={32} /><p>{answer.text}</p></div>
            {!!answer.stores?.length && <ul className={s.results}>
              {answer.stores.map(store => <li key={store.href} className={s.result}>
                <a href={store.href}><strong>{store.name}</strong>{store.city ? ` · ${store.city}` : ""}</a>
                <ul className={s.products}>{store.products.map(product => <li key={product.href}>
                  <a href={product.href}>{product.name}</a>
                  <span>{prices.format(product.price)}{product.available === false ? " · نفدت الكمية" : ""}</span>
                </li>)}</ul>
              </li>)}
            </ul>}
            {answer.links.length > 0 && <ul>{answer.links.map(({ href, label }) => <li key={href}><a href={href}>{label}</a></li>)}</ul>}
            {mode === "ask" && <button type="button" className={s.copy} disabled={busy} onClick={() => switchMode("support")}>ما انحلّت المشكلة</button>}
            {mode === "draft" && <button type="button" className={s.copy} onClick={async () => {
              try { await navigator.clipboard.writeText(answer.text); } catch { setError("تعذّر النسخ تلقائيًا. يمكنك تحديد النص ونسخه."); }
            }}>نسخ المسودة</button>}
          </div>}
        </div>
      </Modal>}
    </div>
  );
}
