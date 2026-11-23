// components/admin/finance/ShippingWithDues.tsx — يلفّ قسم الشحن الحالي بتبويبين: «شركات الشحن والمناديب» (كما هو) و«مستحقات المناديب».
// لا يكرّر إدارة المناديب الموجودة (CouriersManager)؛ يضيف المستحقات والدفعات وكشوف الحساب فقط.
"use client";

import { useMemo, useState } from "react";
import CouriersPanel from "./CouriersPanel";
import { MONTH_NAMES } from "./format";
import s from "./finance.module.css";

export default function ShippingWithDues({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<"providers" | "dues">("providers");
  const now = useMemo(() => new Date(Date.now() + 3 * 3600_000), []); // الشهر الحالي بتوقيت الرياض
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const years = Array.from({ length: now.getUTCFullYear() - 2024 + 2 }, (_, i) => 2024 + i);

  return (
    <div className={s.root}>
      <div className={s.bar}>
        <div className={s.tabs} role="tablist" aria-label="أقسام الشحن">
          <button type="button" role="tab" aria-selected={tab === "providers"} className={`${s.tab} ${tab === "providers" ? s.tabOn : ""}`} onClick={() => setTab("providers")}>شركات الشحن والمناديب</button>
          <button type="button" role="tab" aria-selected={tab === "dues"} className={`${s.tab} ${tab === "dues" ? s.tabOn : ""}`} onClick={() => setTab("dues")}>مستحقات المناديب</button>
        </div>
        {tab === "dues" && (
          <div className={s.pickers}>
            <select className={s.select} value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label="الشهر">{MONTH_NAMES.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}</select>
            <select className={s.select} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="السنة">{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
          </div>
        )}
      </div>
      {tab === "providers" ? children : <CouriersPanel year={year} month={month} />}
    </div>
  );
}
