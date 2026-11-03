// components/dashboard/subscription/InvoicesPanel.tsx
// سجل فواتير الاشتراك (آخر 12 فاتورة من GET /api/subscription): جدول واسع على الكمبيوتر
// وبطاقات على الجوال، مع رابط إيصال لكل فاتورة مدفوعة.
import { FileText, Receipt } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { INVOICE_STATUS, PLAN_NAMES_AR, SubscriptionInvoice, cycleLabel, fmtDate, fmtPeriod, invoiceRef } from "./invoiceFormat";
import s from "../forms.module.css";
import i from "./invoices.module.css";

export default function InvoicesPanel({ invoices }: { invoices: SubscriptionInvoice[] }) {
  return (
    <section id="invoices" className={s.panel} style={uiVars} aria-labelledby="inv-title">
      <div className={s.panelHead}>
        <div className={s.itemLead}>
          <span className={s.itemIcon}><Receipt size={18} strokeWidth={1.7} aria-hidden="true" /></span>
          <div>
            <h2 id="inv-title" className={s.panelTitle}>سجل الفواتير</h2>
            <p className={s.panelSub}>{invoices.length > 0 ? `آخر ${invoices.length} فاتورة اشتراك` : "فواتير اشتراكك تظهر هنا"}</p>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className={s.center + " " + s.centerCol}>
          <FileText size={32} strokeWidth={1.5} color="var(--ui-kicker)" aria-hidden="true" />
          <p style={{ margin: 0 }}>لا توجد فواتير بعد</p>
          <p className={s.help} style={{ margin: 0 }}>تُصدَر فاتورة عند بدء أي عملية دفع للاشتراك أو ترقية الباقة.</p>
        </div>
      ) : (
        <>
          <div className={i.table} role="table" aria-label="فواتير الاشتراك">
            <div className={`${i.cols} ${i.th}`} role="row">
              <span role="columnheader">المرجع</span>
              <span role="columnheader">الباقة / الفترة</span>
              <span role="columnheader">المبلغ</span>
              <span role="columnheader">تاريخ الإصدار</span>
              <span role="columnheader">تاريخ الدفع</span>
              <span role="columnheader">الحالة</span>
              <span role="columnheader" />
            </div>
            {invoices.map((inv) => {
              const st = INVOICE_STATUS[inv.status] ?? INVOICE_STATUS.PENDING;
              return (
                <div key={inv.id} className={`${i.cols} ${i.row}`} role="row">
                  <span className={i.ref}>{invoiceRef(inv.id)}</span>
                  <span>
                    <span className={i.strong}>{PLAN_NAMES_AR[inv.plan] ?? inv.plan}</span>
                    <span className={i.sub}>{fmtPeriod(inv.periodYear, inv.periodMonth)} · {cycleLabel(inv.billingCycle)}</span>
                  </span>
                  <span className={i.money}>{inv.amount} ر.س</span>
                  <span className={i.sub}>{fmtDate(inv.createdAt)}</span>
                  <span className={i.sub}>{fmtDate(inv.paidAt)}</span>
                  <span><StatusBadge label={st.label} tone={st.tone} /></span>
                  <span>{inv.status === "PAID" && <a href={`/dashboard/subscription/invoices/${inv.id}`} className={s.btnSm}>الإيصال</a>}</span>
                </div>
              );
            })}
          </div>

          <ul className={i.cards}>
            {invoices.map((inv) => {
              const st = INVOICE_STATUS[inv.status] ?? INVOICE_STATUS.PENDING;
              return (
                <li key={inv.id} className={i.card}>
                  <div className={i.cardTop}>
                    <span className={i.ref}>{invoiceRef(inv.id)}</span>
                    <StatusBadge label={st.label} tone={st.tone} />
                  </div>
                  <p className={i.strong} style={{ margin: "6px 0 0" }}>{PLAN_NAMES_AR[inv.plan] ?? inv.plan} — {fmtPeriod(inv.periodYear, inv.periodMonth)}</p>
                  <p className={i.sub} style={{ margin: "2px 0 8px" }}>{cycleLabel(inv.billingCycle)} · صدرت {fmtDate(inv.createdAt)}{inv.paidAt ? ` · دُفعت ${fmtDate(inv.paidAt)}` : ""}</p>
                  <div className={i.cardTop}>
                    <span className={i.money}>{inv.amount} ر.س</span>
                    {inv.status === "PAID" && <a href={`/dashboard/subscription/invoices/${inv.id}`} className={s.btnSm}>عرض الإيصال</a>}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
