// app/dashboard/daftari/page.tsx
// المنطق (جلب القيود والملخص، إضافة قيد) كما كان حرفياً؛ التغيير في التخطيط والعرض والصياغة فقط.
"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import MonthSummaryCard, { MonthSummary } from "@/components/daftari/MonthSummaryCard";
import AddEntryForm, { EntryFormState } from "@/components/daftari/AddEntryForm";
import EntryRow from "@/components/daftari/EntryRow";
import { DaftariEntryItem } from "@/components/daftari/types";
import s from "@/components/daftari/daftari.module.css";

const EMPTY_FORM: EntryFormState = { type: "SALE", amount: "", expenseCategory: "", description: "" };

export default function DaftariPage() {
  const [entries, setEntries] = useState<DaftariEntryItem[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [form, setForm] = useState<EntryFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    api
      .get<{ entries: DaftariEntryItem[]; monthSummary: MonthSummary }>("/api/daftari/entries?limit=30")
      .then((d) => { setEntries(d.entries); setSummary(d.monthSummary); })
      .catch((err) => setAccessError(err instanceof ApiError ? err.message : "تعذّر تحميل دفاتري"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setFormError("أدخل مبلغاً صحيحاً");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/daftari/entries", {
        type: form.type,
        amount,
        expenseCategory: form.type === "EXPENSE" && form.expenseCategory ? form.expenseCategory : undefined,
        description: form.description || undefined,
      });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "تعذّرت إضافة القيد");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={s.page} style={uiVars}><p className={s.empty} role="status">جاري التحميل...</p></div>;

  if (accessError) {
    return (
      <div className={s.page} style={uiVars}>
        <div className={s.state}>
          <Wallet size={38} strokeWidth={1.5} aria-hidden="true" />
          <p>{accessError}</p>
          <a href="/pricing" className={s.cta}>
            عرض الباقات
            <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page} style={uiVars}>
      <div className={s.head}>
        <h1 className={s.title}>
          <Wallet size={26} strokeWidth={1.8} aria-hidden="true" />
          دفاتري
        </h1>
        <p className={s.sub}>محاسبة بسيطة لمتجرك: مبيعاتك ومصروفاتك وأرباحك في مكان واحد</p>
      </div>

      {summary && <MonthSummaryCard summary={summary} />}

      <div className={s.layout}>
        <section className={s.panel} aria-labelledby="entries-title">
          <div className={s.panelHead}>
            <div>
              <h2 id="entries-title" className={s.panelTitle}>آخر القيود</h2>
              <p className={s.panelSub}>أحدث 30 حركة مالية</p>
            </div>
          </div>
          {entries.length === 0 ? (
            <p className={s.empty}>لا توجد قيود بعد — سجّل أول عملية بيع أو مصروف</p>
          ) : (
            <ul className={s.list}>
              {entries.map((e) => <li key={e.id}><EntryRow entry={e} /></li>)}
            </ul>
          )}
        </section>

        <div className={`${s.col} ${s.sticky}`}>
          <AddEntryForm
            form={form}
            onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={formError}
          />
        </div>
      </div>
    </div>
  );
}
