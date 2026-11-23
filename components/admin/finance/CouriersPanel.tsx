// components/admin/finance/CouriersPanel.tsx — «مستحقات المناديب»: قائمة المناديب بالأرقام التراكمية، ثم كشف حساب المختار.
// تُعرض داخل قسم الشحن (تبويب) وداخل المركز المالي.
"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import EmptyState from "@/components/admin/ui/EmptyState";
import ErrorState from "@/components/admin/ui/ErrorState";
import LoadingState from "@/components/admin/ui/LoadingState";
import f from "@/components/dashboard/forms.module.css";
import CourierStatement from "./CourierStatement";
import { sar } from "./format";
import s from "./finance.module.css";

interface CourierRow {
  id: string; name: string; city: string; phone: string; isActive: boolean; currentWageSar: number | null;
  assignedCount: number; deliveredCount: number; failedOrReturnedCount: number; accruedMinor: number; paidMinor: number; balanceMinor: number; undocumentedCount: number;
}

export default function CouriersPanel({ year, month, onChanged }: { year: number; month: number; onChanged?: () => void }) {
  const [rows, setRows] = useState<CourierRow[] | null>(null);
  const [totals, setTotals] = useState<{ accruedMinor: number; paidMinor: number; balanceMinor: number } | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(() => {
    setError("");
    api.get<{ couriers: CourierRow[]; totals: { accruedMinor: number; paidMinor: number; balanceMinor: number } }>(`/api/admin/finance/couriers?year=${year}&month=${month}`)
      .then((r) => { setRows(r.couriers); setTotals(r.totals); }).catch((e) => setError(e instanceof ApiError ? e.message : "تعذّر التحميل"));
  }, [year, month]);
  useEffect(load, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows || !totals) return <LoadingState label="جاري تحميل مستحقات المناديب..." />;
  return (
    <div className={s.root}>
      <div className={s.card}>
        <h2 className={s.h2}>مستحقات المناديب</h2>
        <p className={s.sub}>المستحق والمدفوع والمتبقي تراكمي حتى نهاية الشهر المختار (من الأجر الثابت على كل شحنة وقت الإسناد). مستحق الشهر {sar(totals.accruedMinor)} — مدفوع الشهر {sar(totals.paidMinor)} — إجمالي المتبقي {sar(totals.balanceMinor)}.</p>
        {rows.length === 0 ? <EmptyState message="لا مناديب مسجّلون بعد" /> : (
          <div className={s.scroll}>
            <table className={s.table}>
              <thead><tr><th>المندوب</th><th>المدينة</th><th>الحالة</th><th>مسندة</th><th>مسلَّمة</th><th>فاشلة/مرتجعة</th><th>إجمالي المستحق</th><th>المدفوع</th><th>المتبقي</th><th /></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}<div className={s.muted}>{r.phone}</div></td><td>{r.city}</td><td>{r.isActive ? "نشط" : "غير نشط"}</td>
                  <td className={s.num}>{r.assignedCount}</td><td className={s.num}>{r.deliveredCount}{r.undocumentedCount ? <div className={s.muted}>غير موثقة {r.undocumentedCount}</div> : null}</td><td className={s.num}>{r.failedOrReturnedCount}</td>
                  <td className={s.num}>{sar(r.accruedMinor)}</td><td className={s.num}>{sar(r.paidMinor)}</td><td className={`${s.num} ${r.balanceMinor < 0 ? s.neg : ""}`}>{sar(r.balanceMinor)}</td>
                  <td><button type="button" className={`${f.btnSm} ${selected === r.id ? f.btnPrimary : ""}`} onClick={() => setSelected(selected === r.id ? null : r.id)}>كشف الحساب</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      {selected && <CourierStatement courierId={selected} year={year} month={month} onChanged={() => { load(); onChanged?.(); }} />}
    </div>
  );
}
