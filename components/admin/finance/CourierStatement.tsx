// components/admin/finance/CourierStatement.tsx — كشف حساب مندوب: الشحنات (موثقة/غير موثقة) والدفعات والرصيد، مع تصدير CSV.
"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import ErrorState from "@/components/admin/ui/ErrorState";
import LoadingState from "@/components/admin/ui/LoadingState";
import type { StatementRow } from "@/lib/finance/statement";
import { dateOnly, sar } from "./format";
import { F, ltrClass } from "./forms";
import PayoutForm from "./PayoutForm";
import s from "./finance.module.css";

type Stmt = {
  courier: { id: string; name: string; city: string; phone: string; isActive: boolean };
  lines: (Omit<StatementRow, "deliveredAt"> & { deliveredAt: string })[];
  payments: { id: string; settledAt: string; amountMinor: number; isReversal: boolean; method: string | null; reference: string | null; note: string | null }[];
  totals: { deliveredInPeriod: number; documentedCount: number; undocumentedCount: number; accruedInPeriodMinor: number; paidInPeriodMinor: number; accruedAllTimeMinor: number; balanceAllTimeMinor: number };
  shipmentsByStatus: { assigned: number; delivered: number; failedOrReturned: number };
};
const PAY: Record<string, string> = { PAID: "مدفوع", PARTIAL: "جزئي", UNPAID: "غير مدفوع", NA: "—" };

export default function CourierStatement({ courierId, year, month, onChanged }: { courierId: string; year: number; month: number; onChanged: () => void }) {
  const first = dateOnly(new Date(Date.UTC(year, month - 1, 1, 12)));
  const last = dateOnly(new Date(Date.UTC(year, month, 0, 12)));
  const [range, setRange] = useState({ from: first, to: last });
  const [data, setData] = useState<Stmt | null>(null);
  const [error, setError] = useState("");
  useEffect(() => setRange({ from: first, to: last }), [first, last]);

  // الفترة بتوقيت الرياض: من بداية يوم البدء حتى نهاية يوم الانتهاء (شاملة)
  const qs = `from=${encodeURIComponent(`${range.from}T00:00:00+03:00`)}&to=${encodeURIComponent(`${dateOnly(new Date(new Date(`${range.to}T00:00:00+03:00`).getTime() + 86400000))}T00:00:00+03:00`)}`;
  const load = useCallback(() => {
    setError("");
    api.get<Stmt>(`/api/admin/finance/couriers/${courierId}?${qs}`).then(setData).catch((e) => setError(e instanceof ApiError ? e.message : "تعذّر التحميل"));
  }, [courierId, qs]);
  useEffect(load, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState label="جاري تحميل كشف الحساب..." />;
  const t = data.totals;
  return (
    <div className={s.card}>
      <div className={s.split}>
        <div><h2 className={s.h2}>كشف حساب: {data.courier.name}</h2><p className={s.sub}>{data.courier.city} — {data.courier.phone}{data.courier.isActive ? "" : " — غير نشط"}</p></div>
        <a className={s.link} href={`/api/admin/finance/couriers/${courierId}?${qs}&format=csv`}><Download size={15} strokeWidth={1.9} />تصدير CSV</a>
      </div>
      <div className={s.formGrid}>
        <F label="من"><input className={ltrClass} type="date" value={range.from} onChange={(e) => setRange((p) => ({ ...p, from: e.target.value }))} dir="ltr" /></F>
        <F label="إلى"><input className={ltrClass} type="date" value={range.to} onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))} dir="ltr" /></F>
      </div>
      <div className={s.facts}>
        <div className={s.fact}><p className={s.factL}>مستحق الفترة (موثَّق)</p><p className={s.factV}>{sar(t.accruedInPeriodMinor)}</p></div>
        <div className={s.fact}><p className={s.factL}>مدفوع في الفترة</p><p className={s.factV}>{sar(t.paidInPeriodMinor)}</p></div>
        <div className={s.fact}><p className={s.factL}>إجمالي المستحق (منذ البداية)</p><p className={s.factV}>{sar(t.accruedAllTimeMinor)}</p></div>
        <div className={s.fact}><p className={s.factL}>الرصيد المتبقي له</p><p className={`${s.factV} ${t.balanceAllTimeMinor < 0 ? s.neg : ""}`}>{sar(t.balanceAllTimeMinor)}</p></div>
        <div className={s.fact}><p className={s.factL}>شحنات الفترة</p><p className={s.factV}>{t.deliveredInPeriod}{t.undocumentedCount ? ` (غير موثقة ${t.undocumentedCount})` : ""}</p></div>
      </div>
      <p className={s.muted}>مسندة {data.shipmentsByStatus.assigned} — مسلَّمة {data.shipmentsByStatus.delivered} — فاشلة/مرتجعة {data.shipmentsByStatus.failedOrReturned}. الشحنات غير الموثقة لا تدخل المستحق. أجر المندوب منفصل عن أي مبالغ COD أو أموال تجار بحوزته (لا مقاصّة تلقائية).</p>
      <div className={s.scroll}>
        <table className={s.table}>
          <thead><tr><th>رقم الطلب</th><th>تاريخ التسليم</th><th>المدينة</th><th>قيمة التوصيل</th><th>مستحق المندوب</th><th>الاستحقاق</th><th>السداد</th></tr></thead>
          <tbody>{data.lines.length === 0 ? <tr><td colSpan={7} className={s.muted}>لا شحنات مسلَّمة في هذه الفترة</td></tr> : data.lines.map((l) => (
            <tr key={l.shipmentId}><td>{l.orderNumber}</td><td className={s.num}>{dateOnly(l.deliveredAt)}</td><td>{l.city}</td><td className={s.num}>{sar(l.deliveryFeeMinor)}</td><td className={s.num}>{sar(l.wageMinor)}</td>
              <td>{l.dueStatus === "DOCUMENTED" ? "موثق" : <span className={`${s.q} ${s.qBad}`}>غير موثق</span>}</td><td>{PAY[l.paymentStatus]}</td></tr>
          ))}</tbody>
        </table>
      </div>
      {data.payments.length > 0 && (
        <div className={s.scroll}>
          <table className={s.table}>
            <thead><tr><th>تاريخ الدفعة</th><th>المبلغ</th><th>الوسيلة</th><th>المرجع</th><th>ملاحظة</th></tr></thead>
            <tbody>{data.payments.map((p) => <tr key={p.id}><td className={s.num}>{dateOnly(p.settledAt)}</td><td className={`${s.num} ${p.isReversal ? s.neg : ""}`}>{sar(p.isReversal ? -p.amountMinor : p.amountMinor)}</td><td>{p.method ?? "—"}</td><td>{p.reference ?? "—"}</td><td>{p.isReversal ? "قيد عكسي — " : ""}{p.note ?? ""}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      <PayoutForm courierId={courierId} outstandingMinor={Math.max(0, t.balanceAllTimeMinor)} onDone={() => { load(); onChanged(); }} />
    </div>
  );
}
