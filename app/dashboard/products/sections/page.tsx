"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronRight, Layers, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import s from "@/components/dashboard/forms.module.css";
import layout from "./sections.module.css";

interface Section {
  id: string;
  name: string;
  position: number;
}

export default function StoreSectionsPage() {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    api.get<{ sections: Section[] }>("/api/store-sections")
      .then(({ sections }) => {
        if (!active) return;
        setSections(sections);
        setPosition(String(nextPosition(sections)));
      })
      .catch((err) => { if (active) setError(err instanceof ApiError ? err.message : "تعذّر تحميل الأقسام."); });
    return () => { active = false; };
  }, []);

  function select(section?: Section) {
    setEditing(section?.id ?? null);
    setName(section?.name ?? "");
    setPosition(String(section?.position ?? nextPosition(sections ?? [])));
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sections) return;
    setBusy(true);
    setError("");
    setStatus("");
    const data = { name: name.trim(), position: Number(position) };
    try {
      if (editing) {
        await api.patch("/api/store-sections", { id: editing, ...data });
        setSections(sections.map((item) => item.id === editing ? { ...item, ...data } : item).sort(sortSections));
      } else {
        const { section } = await api.post<{ section: Section }>("/api/store-sections", data);
        setSections([...sections, section].sort(sortSections));
      }
      select();
      setPosition(String(Math.max(nextPosition(sections ?? []), Math.min(999, data.position + 1))));
      setStatus("تم حفظ القسم.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ القسم.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(section: Section) {
    if (!sections || !window.confirm(`حذف قسم «${section.name}»؟ ستبقى منتجاته في المتجر وتصبح بدون قسم.`)) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await api.delete(`/api/store-sections?id=${encodeURIComponent(section.id)}`);
      setSections(sections.filter((item) => item.id !== section.id));
      if (editing === section.id) select();
      setStatus("تم حذف القسم.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حذف القسم.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={s.page} style={uiVars} dir="rtl">
      <Link href="/dashboard/products" className={s.back}><ChevronRight size={16} aria-hidden="true" /> منتجاتي</Link>
      <header className={s.head}>
        <div>
          <h1 className={s.title}>أقسام المتجر</h1>
          <p className={s.sub}>رتّب منتجاتك ليسهل على الزوار تصفحها.</p>
        </div>
      </header>
      {error && <p className={s.err} role="alert">{error}</p>}
      {status && <p className={s.ok} role="status">{status}</p>}
      {!sections && !error && <p className={s.state} role="status">جاري تحميل الأقسام…</p>}
      {sections && (
        <div className={s.layout}>
          <section className={s.panel} aria-labelledby="section-list">
            <div className={s.panelHead}><h2 id="section-list" className={s.panelTitle}>الأقسام</h2></div>
            <div className={s.panelBody}>
              {sections.length === 0 ? <p className={s.help}>أضف أول قسم، ثم اختره من صفحة إضافة المنتج أو تعديله.</p> : (
                <ul className={layout.list}>
                  {sections.map((section) => (
                    <li key={section.id} className={layout.row}>
                      <span className={layout.name}><Layers size={17} aria-hidden="true" /> {section.name}</span>
                      <div className={layout.actions}>
                        <button type="button" className={`${s.cta} ${s.ghost}`} disabled={busy} onClick={() => select(section)} aria-label={`تعديل ${section.name}`}>تعديل</button>
                        <button type="button" className={`${s.cta} ${s.ghost}`} disabled={busy} onClick={() => remove(section)} aria-label={`حذف ${section.name}`}>حذف</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <section className={s.panel} aria-labelledby="section-form">
            <div className={s.panelHead}><h2 id="section-form" className={s.panelTitle}>{editing ? "تعديل القسم" : "إضافة قسم"}</h2></div>
            <form className={s.panelBody} onSubmit={save}>
              <label className={s.fieldWrap}>
                <span className={s.fieldLabel}>اسم القسم</span>
                <input className={s.field} required maxLength={60} value={name} disabled={busy} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className={s.fieldWrap}>
                <span className={s.fieldLabel}>ترتيب الظهور</span>
                <input className={s.field} type="number" min={0} max={999} required value={position} disabled={busy} onChange={(event) => setPosition(event.target.value)} />
              </label>
              <p className={s.help}>تظهر الأرقام الأصغر أولًا.</p>
              <div className={s.actions}>
                <button className={s.cta} disabled={busy || !name.trim()} type="submit">
                  {!editing && <Plus size={17} aria-hidden="true" />} {editing ? "حفظ التعديل" : "إضافة القسم"}
                </button>
                {editing && <button type="button" className={`${s.cta} ${s.ghost}`} disabled={busy} onClick={() => select()}>إلغاء</button>}
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function sortSections(a: Section, b: Section) {
  return a.position - b.position || (a.id < b.id ? -1 : 1);
}

function nextPosition(sections: Section[]) {
  return Math.min(999, (sections.at(-1)?.position ?? -1) + 1);
}
