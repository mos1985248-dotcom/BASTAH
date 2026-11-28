"use client";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import s from "@/components/dashboard/forms.module.css";

type Article = { id: string; question: string; answer: string; aliases: string[]; published: boolean };
export default function MuniraKnowledge() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aliases, setAliases] = useState("");
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const load = useCallback(async () => {
    const result = await api.get<{ articles: Article[] }>("/api/admin/munira/knowledge");
    setArticles(result.articles); setReady(true);
  }, []);
  useEffect(() => { void load().catch(() => setStatus("مكتبة المعرفة غير متاحة. تحقق من تجهيز قاعدة البيانات.")); }, [load]);
  const edit = (item: Article) => {
    setQuestion(item.question); setAnswer(item.answer); setAliases(item.aliases.join("\n")); setPublished(item.published); setStatus("");
  };
  return <section className={s.panel} dir="rtl">
    <div className={s.panelHead}><h2 className={s.panelTitle}>معرفة منيرة العامة</h2></div>
    <div className={s.panelBody}>
      <p>أضف معلومات عامة معتمدة للزوار فقط. لا تُدخل بيانات العملاء أو التجار أو الأسرار. الأسئلة الشائعة المنشورة تظل مرجعًا أساسيًا؛ المادة المنشورة ذات السؤال المطابق تستبدل إجابتها في منيرة.</p>
      {status && <p role="status">{status}</p>}
      <form onSubmit={async event => {
        event.preventDefault(); setBusy(true); setStatus("");
        try {
          await api.post("/api/admin/munira/knowledge", { question, answer, aliases: aliases.split("\n").map(x => x.trim()).filter(Boolean), published });
          await load(); setStatus(published ? "تم حفظ المادة ونشرها." : "تم حفظ المسودة دون نشر.");
        } catch (error) { setStatus(error instanceof ApiError ? error.message : "تعذّر الحفظ."); }
        finally { setBusy(false); }
      }}>
        <label className={s.fieldWrap}>السؤال<input className={s.field} required minLength={3} maxLength={180} value={question} onChange={e => setQuestion(e.target.value)} /></label>
        <label className={s.fieldWrap}>الإجابة المعتمدة<textarea className={s.field} required minLength={5} maxLength={1500} rows={5} value={answer} onChange={e => setAnswer(e.target.value)} /></label>
        <label className={s.fieldWrap}>صيغ السؤال البديلة (صيغة في كل سطر، حتى 12)<textarea className={s.field} rows={3} value={aliases} onChange={e => setAliases(e.target.value)} /></label>
        <label><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> نشر للزوار</label>
        <div className={s.itemActions}><button className={s.cta} disabled={busy || !ready}>حفظ المادة</button><button type="button" className={s.btnSm} onClick={() => { setQuestion(""); setAnswer(""); setAliases(""); setPublished(false); setStatus(""); }}>مادة جديدة</button></div>
      </form>
      {articles.map(item => <article key={item.id} className={s.panel}><div className={s.panelBody}>
        <strong>{item.question}</strong><p>{item.answer}</p><p>{item.published ? "منشورة" : "مسودة"}</p>
        <button type="button" className={s.btnSm} onClick={() => edit(item)}>تعديل</button>
      </div></article>)}
    </div>
  </section>;
}
