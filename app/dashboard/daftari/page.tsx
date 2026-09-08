// app/dashboard/daftari/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import MonthSummaryCard, { MonthSummary } from "@/components/daftari/MonthSummaryCard";
import AddEntryForm, { EntryFormState } from "@/components/daftari/AddEntryForm";
import EntryRow from "@/components/daftari/EntryRow";
import { DaftariEntryItem } from "@/components/daftari/types";

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
      setFormError("أدخلي مبلغاً صحيحاً");
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

  if (loading) return <p style={{ textAlign: "center", padding: t.spacing["10"], color: t.colors.text.mid }}>جاري التحميل...</p>;

  if (accessError) {
    return (
      <div style={{ textAlign: "center", padding: t.spacing["12"] }}>
        <Wallet size={38} strokeWidth={1.5} color={t.colors.text.light} style={{ margin: "0 auto" }} />
        <p style={{ color: t.colors.text.mid, margin: `${t.spacing["3"]} 0` }}>{accessError}</p>
        <a href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
          عرض الباقات
          <ArrowLeft size={15} strokeWidth={2} />
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: t.typography.fontSize.xl, color: t.colors.primary[800] }}>
          <Wallet size={22} strokeWidth={1.8} />
          دفاتري
        </h1>

        {summary && <MonthSummaryCard summary={summary} />}

        <AddEntryForm
          form={form}
          onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={formError}
        />

        <div>
          <h2 style={{ fontSize: t.typography.fontSize.base, color: t.colors.text.dark, marginBottom: t.spacing["2"] }}>آخر القيود</h2>
          {entries.length === 0 ? (
            <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>لا توجد قيود بعد — سجّلي أول عملية بيع أو مصروف</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
              {entries.map((e) => <EntryRow key={e.id} entry={e} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
