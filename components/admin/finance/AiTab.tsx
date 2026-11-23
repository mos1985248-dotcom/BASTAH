// components/admin/finance/AiTab.tsx — تكلفة الذكاء الاصطناعي: حسب المتجر والباقة والميزة، ومطابقة فواتير المزوّد الموثقة.
// مصدر واحد لتكلفة التشغيل: الفاتورة الموثقة إن وُجدت وإلا المحسوبة مؤقتاً. شحن الرصيد المسبق تدفق نقدي فقط.
"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import f from "@/components/dashboard/forms.module.css";
import type { SummaryResponse } from "./api-types";
import FlagsBanner from "./FlagsBanner";
import { dateOnly, pct, sar, usd } from "./format";
import { F, inputClass, ltrClass, useSubmit } from "./forms";
import Quality from "./Quality";
import s from "./finance.module.css";

interface InvoiceRow { id: string; provider: string; kind: "USAGE_INVOICE" | "PREPAID_TOPUP"; periodStart: string | null; periodEnd: string | null; amountUsd: string; fxRateSarPerUsd: string | null; fxRateDate: string | null; paidAt: string | null; reference: string | null }

function InvoiceForm({ onDone }: { onDone: () => void }) {
  const [v, setV] = useState({ provider: "anthropic", kind: "USAGE_INVOICE", periodStart: "", periodEnd: "", amountUsd: "", fx: "", fxDate: "", paidAt: "", reference: "", note: "" });
  const sub = useSubmit();
  const set = (k: keyof typeof v, val: string) => setV((p) => ({ ...p, [k]: val }));
  const submit = async () => {
    const ok = await sub.run(() => api.post("/api/admin/finance/ai", {
      provider: v.provider, kind: v.kind, periodStart: v.kind === "USAGE_INVOICE" ? v.periodStart && `${v.periodStart}T00:00:00+03:00` : null, periodEnd: v.kind === "USAGE_INVOICE" ? v.periodEnd && `${v.periodEnd}T00:00:00+03:00` : null,
      amountUsd: v.amountUsd, fxRateSarPerUsd: v.fx || null, fxRateDate: v.fx ? v.fxDate || null : null, fxSource: v.fx ? "إدخال يدوي موثّق" : null, paidAt: v.paidAt || null, reference: v.reference || null, note: v.note || null,
    }), "تم تسجيل الفاتورة");
    if (ok) { setV((p) => ({ ...p, amountUsd: "", reference: "", note: "" })); onDone(); }
  };
  return (
    <div className={f.formBox}>
      <h3 className={s.h2}>تسجيل فاتورة أو شحن رصيد للمزوّد</h3>
      <p className={s.sub}>الدولار يُحفظ بعملته الأصلية. أدخل سعر صرف موثَّقاً بتاريخه إن أردت التحويل للريال؛ بدونه تبقى القيمة بالدولار فقط. لا تُسجَّل الفاتورة نفسها كمصروف يدوي أيضاً (ازدواج).</p>
      <div className={s.formGrid}>
        <F label="المزوّد"><input className={ltrClass} value={v.provider} onChange={(e) => set("provider", e.target.value)} dir="ltr" /></F>
        <F label="النوع"><select className={inputClass} value={v.kind} onChange={(e) => set("kind", e.target.value)}><option value="USAGE_INVOICE">فاتورة استهلاك لفترة</option><option value="PREPAID_TOPUP">شحن رصيد مسبق (نقد)</option></select></F>
        {v.kind === "USAGE_INVOICE" && <><F label="بداية الفترة"><input className={ltrClass} type="date" value={v.periodStart} onChange={(e) => set("periodStart", e.target.value)} dir="ltr" /></F><F label="نهاية الفترة (حصرية)"><input className={ltrClass} type="date" value={v.periodEnd} onChange={(e) => set("periodEnd", e.target.value)} dir="ltr" /></F></>}
        <F label="المبلغ (دولار)"><input className={ltrClass} type="number" min={0} step="0.0001" value={v.amountUsd} onChange={(e) => set("amountUsd", e.target.value)} dir="ltr" /></F>
        <F label="تاريخ الدفع"><input className={ltrClass} type="date" value={v.paidAt} onChange={(e) => set("paidAt", e.target.value)} dir="ltr" /></F>
        <F label="سعر الصرف (ريال/دولار) — اختياري"><input className={ltrClass} type="number" min={0} step="0.00001" value={v.fx} onChange={(e) => set("fx", e.target.value)} dir="ltr" /></F>
        {v.fx && <F label="تاريخ سعر الصرف"><input className={ltrClass} type="date" value={v.fxDate} onChange={(e) => set("fxDate", e.target.value)} dir="ltr" /></F>}
        <F label="المرجع (اختياري)"><input className={ltrClass} value={v.reference} onChange={(e) => set("reference", e.target.value)} dir="ltr" /></F>
      </div>
      {sub.error && <p className={f.err} role="alert">{sub.error}</p>}
      {sub.ok && <p className={s.ok}>{sub.ok}</p>}
      <button type="button" className={f.cta} disabled={sub.busy || !v.amountUsd} onClick={submit}>{sub.busy ? "جاري التسجيل..." : "تسجيل"}</button>
    </div>
  );
}

export default function AiTab({ data, onChanged }: { data: SummaryResponse; onChanged: () => void }) {
  const ai = data.summary.ai;
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(() => { api.get<{ invoices: InvoiceRow[] }>("/api/admin/finance/ai").then((r) => setInvoices(r.invoices)).catch((e) => setError(e instanceof ApiError ? e.message : "تعذّر تحميل الفواتير")); }, []);
  useEffect(load, [load]);
  const paying = data.summary.subscriptions.preVatMinor;
  const storesWithAi = ai.byStore.filter((x) => x.storeId).length;
  return (
    <div className={s.root}>
      <FlagsBanner flags={data.summary.flags.filter((x) => x.code.startsWith("AI_"))} />
      <div className={s.kpis}>
        <div className={s.card}><p className={s.factL}>مصدر تكلفة الشهر</p><p className={s.factV}>{ai.source === "DOCUMENTED" ? "فاتورة موثقة" : ai.source === "PROVISIONAL" ? "محسوبة مؤقتاً" : "لا بيانات"}</p><Quality q={ai.source === "DOCUMENTED" ? "OK" : "EST"} /></div>
        <div className={s.card}><p className={s.factL}>التكلفة بالدولار</p><p className={s.factV}>{usd(ai.costUsdMicro)}</p></div>
        <div className={s.card}><p className={s.factL}>التكلفة بالريال</p><p className={s.factV}>{sar(ai.costSarMinor)}</p>{ai.costSarMinor === null && ai.costUsdMicro > 0 && <Quality q="BAD" title="لا سعر صرف موثَّق" />}</div>
        <div className={s.card}><p className={s.factL}>نسبتها إلى إيراد الاشتراكات</p><p className={s.factV}>{pct(ai.revenueRatio === null ? null : ai.revenueRatio * 100)}</p><p className={s.muted}>نسبة فقط، ليست ربحاً: بقية تكاليف الخدمة قائمة{paying === null ? " (الإيراد قبل الضريبة غير محدد)" : ""}.</p></div>
        <div className={s.card}><p className={s.factL}>متوسط التكلفة لكل متجر مستخدم</p><p className={s.factV}>{storesWithAi ? usd(Math.round(ai.byStore.filter((x) => x.storeId).reduce((a, x) => a + x.costUsdMicro, 0) / storesWithAi)) : "—"}</p><p className={s.muted}>المقام: {storesWithAi} متجر استخدم الذكاء الاصطناعي هذا الشهر</p></div>
        <div className={s.card}><p className={s.factL}>مطابقة المزوّد</p><p className={s.factV}>{ai.reconciliationDiffUsdMicro === null ? "لا فاتورة موثقة" : `${usd(ai.reconciliationDiffUsdMicro)} فرق`}</p><p className={s.muted}>الموثّق {usd(ai.documentedUsdMicro)} مقابل المحسوب {usd(ai.provisionalUsdMicro)}</p></div>
        <div className={s.card}><p className={s.factL}>نقد مدفوع للمزوّد (الشهر)</p><p className={s.factV}>{usd(ai.cashOutUsdMicro)}</p><p className={s.muted}>يشمل شحن الرصيد المسبق — تدفق نقدي لا استهلاك</p></div>
      </div>
      <div className={s.grid2}>
        <div className={s.card}><h2 className={s.h2}>حسب المتجر</h2><div className={s.scroll}><table className={s.table}><thead><tr><th>المتجر</th><th>التكلفة</th><th>استدعاءات</th></tr></thead><tbody>
          {ai.byStore.length === 0 ? <tr><td colSpan={3} className={s.muted}>لا استخدام</td></tr> : ai.byStore.map((x) => <tr key={x.storeId ?? "platform"}><td>{x.storeId ? data.storeNames[x.storeId] ?? x.storeId.slice(0, 8) : "استخدام المنصة"}</td><td className={s.num}>{usd(x.costUsdMicro)}</td><td className={s.num}>{x.count}</td></tr>)}</tbody></table></div></div>
        <div className={s.card}><h2 className={s.h2}>حسب الباقة والميزة</h2><div className={s.scroll}><table className={s.table}><thead><tr><th>الباقة</th><th>التكلفة</th></tr></thead><tbody>
          {ai.byPlan.map((x) => <tr key={x.plan}><td>{data.planNames[x.plan] ?? x.plan}</td><td className={s.num}>{usd(x.costUsdMicro)}</td></tr>)}</tbody></table></div>
          <div className={s.scroll}><table className={s.table}><thead><tr><th>الميزة</th><th>التكلفة</th></tr></thead><tbody>{ai.byFeature.map((x) => <tr key={x.feature}><td>{x.feature}</td><td className={s.num}>{usd(x.costUsdMicro)}</td></tr>)}</tbody></table></div>
          <p className={s.muted}>التوزيع تحليلي من سجل الاستخدام (ليس بالضرورة مساوياً لفاتورة المزوّد). الباقة المأخوذة من اشتراك المتجر الحالي لا وقت الاستدعاء تُحتسب تقديرية.</p></div>
      </div>
      <InvoiceForm onDone={() => { load(); onChanged(); }} />
      <div className={s.card}>
        <h2 className={s.h2}>فواتير المزوّد وشحن الرصيد المسجّلة</h2>
        {error && <p className={f.err}>{error}</p>}
        <div className={s.scroll}><table className={s.table}><thead><tr><th>المزوّد</th><th>النوع</th><th>الفترة</th><th>دولار</th><th>سعر الصرف</th><th>الدفع</th></tr></thead><tbody>
          {invoices.length === 0 ? <tr><td colSpan={6} className={s.muted}>لا فواتير مسجّلة</td></tr> : invoices.map((i) => <tr key={i.id}><td>{i.provider}</td><td>{i.kind === "USAGE_INVOICE" ? "استهلاك" : "شحن مسبق"}</td><td className={s.num}>{i.periodStart ? `${dateOnly(i.periodStart)} → ${dateOnly(i.periodEnd as string)}` : "—"}</td><td className={s.num}>{Number(i.amountUsd).toFixed(2)}</td><td className={s.num}>{i.fxRateSarPerUsd ? `${Number(i.fxRateSarPerUsd)} (${dateOnly(i.fxRateDate as string)})` : "غير موثَّق"}</td><td className={s.num}>{i.paidAt ? dateOnly(i.paidAt) : "—"}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}
