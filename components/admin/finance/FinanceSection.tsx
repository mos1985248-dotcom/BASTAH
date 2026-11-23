// components/admin/finance/FinanceSection.tsx — «المركز المالي»: اختيار الشهر/السنة، تبويبات، وتصدير CSV. يُسجَّل في لوحة الإدارة.
"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import ErrorState from "@/components/admin/ui/ErrorState";
import LoadingState from "@/components/admin/ui/LoadingState";
import AiTab from "./AiTab";
import CouriersPanel from "./CouriersPanel";
import ExpensesTab from "./ExpensesTab";
import { MONTH_NAMES } from "./format";
import OverviewTab from "./OverviewTab";
import SettingsTab from "./SettingsTab";
import SettlementsTab from "./SettlementsTab";
import { useFinanceData } from "./useFinanceData";
import s from "./finance.module.css";

const TABS = [["overview", "نظرة عامة"], ["expenses", "المصروفات"], ["couriers", "مستحقات المناديب"], ["settlements", "التسويات والاستردادات"], ["ai", "الذكاء الاصطناعي"], ["settings", "الإعدادات"]] as const;
type Tab = (typeof TABS)[number][0];

export default function FinanceSection() {
  // الشهر الحالي بتوقيت الرياض (UTC+3)
  const now = useMemo(() => new Date(Date.now() + 3 * 3600_000), []);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [tab, setTab] = useState<Tab>("overview");
  const { data, error, loading, reload } = useFinanceData(year, month);
  const years = Array.from({ length: now.getUTCFullYear() - 2024 + 2 }, (_, i) => 2024 + i);

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <div className={s.pickers}>
          <select className={s.select} value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label="الشهر">{MONTH_NAMES.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}</select>
          <select className={s.select} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="السنة">{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
        <a className={s.link} href={`/api/admin/finance/export?type=summary&year=${year}&month=${month}`}><Download size={15} strokeWidth={1.9} />تصدير الملخص CSV</a>
      </div>
      <div className={s.tabs} role="tablist" aria-label="أقسام المركز المالي">
        {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={`${s.tab} ${tab === id ? s.tabOn : ""}`} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {tab === "couriers" ? <CouriersPanel year={year} month={month} onChanged={reload} /> : tab === "expenses" ? <ExpensesTab year={year} month={month} onChanged={reload} />
        : tab === "settlements" ? <SettlementsTab year={year} month={month} onChanged={reload} />
        : error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <LoadingState label="جاري تحميل المركز المالي..." />
        : data ? (tab === "overview" ? <OverviewTab data={data} /> : tab === "ai" ? <AiTab data={data} onChanged={reload} /> : <SettingsTab data={data} onChanged={reload} />) : null}
    </div>
  );
}
