// app/dashboard/subscription/invoices/[id]/page.tsx
// إيصال دفع اشتراك قابل للطباعة/الحفظ PDF. يقرأ نفس GET /api/subscription (آخر 12 فاتورة)
// دون أي تعديل على الـAPI. ملاحظة: هذا إيصال دفع وليس فاتورة ضريبية رسمية.
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, Printer } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { INVOICE_STATUS, PLAN_NAMES_AR, SubscriptionInvoice, cycleLabel, fmtDate, fmtPeriod, invoiceRef } from "@/components/dashboard/subscription/invoiceFormat";
import s from "@/components/dashboard/forms.module.css";
import r from "@/components/dashboard/subscription/receipt.module.css";

export default function InvoiceReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<SubscriptionInvoice | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    fetch("/api/subscription")
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) throw new Error(body?.error ?? "تعذّر تحميل الفاتورة");
        const found = (body.invoices as SubscriptionInvoice[]).find((i) => i.id === id);
        if (!found) throw new Error("لم نعثر على هذه الفاتورة ضمن آخر 12 فاتورة");
        setInvoice(found);
      })
      .catch((err) => setError(err.message ?? "تعذّر تحميل الفاتورة"));
  };
  useEffect(load, [id]);

  const wrap = (children: React.ReactNode) => <div className={s.page} style={uiVars}>{children}</div>;
  if (error) return wrap(<ErrorState message={error} onRetry={load} />);
  if (!invoice) return wrap(<LoadingState label="جاري تحميل الفاتورة..." />);

  const st = INVOICE_STATUS[invoice.status] ?? INVOICE_STATUS.PENDING;
  const rows: [string, string][] = [
    ["الباقة", PLAN_NAMES_AR[invoice.plan] ?? invoice.plan],
    ["الفترة", `${fmtPeriod(invoice.periodYear, invoice.periodMonth)} · ${cycleLabel(invoice.billingCycle)}`],
    ["تاريخ الإصدار", fmtDate(invoice.createdAt)],
    ["تاريخ الدفع", fmtDate(invoice.paidAt)],
    ...(invoice.moyasarTxnId ? ([["رقم عملية الدفع", invoice.moyasarTxnId]] as [string, string][]) : []),
  ];

  return wrap(
    <>
      <div className={r.toolbar}>
        <a href="/dashboard/subscription#invoices" className={s.back}>
          <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
          سجل الفواتير
        </a>
        <button type="button" className={s.cta} onClick={() => window.print()}>
          <Printer size={16} strokeWidth={1.9} aria-hidden="true" />
          طباعة / حفظ PDF
        </button>
      </div>

      <article className={r.paper} aria-label="إيصال دفع اشتراك">
        <header className={r.head}>
          <div>
            <p className={r.brand}>بسطة مارت</p>
            <h1 className={r.title}>إيصال دفع اشتراك</h1>
          </div>
          <div className={r.refBox}>
            <span className={r.refLabel}>المرجع</span>
            <span className={r.ref}>{invoiceRef(invoice.id)}</span>
            <StatusBadge label={st.label} tone={st.tone} />
          </div>
        </header>

        <dl className={r.list}>
          {rows.map(([k, v]) => (
            <div key={k} className={r.line}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className={r.total}>
          <span>المبلغ</span>
          <span className={r.totalValue}>{invoice.amount} ر.س</span>
        </div>
        <p className={r.note}>هذا إيصال دفع صادر من لوحة بسطة مارت لعملية اشتراك، وليس فاتورة ضريبية رسمية.</p>
      </article>
    </>,
  );
}
