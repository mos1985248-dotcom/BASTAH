// components/dashboard/DaftariDashboardCard.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import s from "./home.module.css";

interface MonthSummary { income: number; expenses: number; refunds: number; netProfit: number }

export default function DaftariDashboardCard({ plan }: { plan: string }) {
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const hasAccess = plan !== "FREE";

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    api
      .get<{ monthSummary: MonthSummary }>("/api/daftari/entries?limit=1")
      .then((d) => setSummary(d.monthSummary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hasAccess]);

  return (
    <section className={s.card} style={uiVars} aria-labelledby="daftari-card-title">
      <div className={s.cardHead}>
        <div>
          <h2 id="daftari-card-title" className={s.cardTitle}>دفاتري — محاسبة بسيطة</h2>
          <p className={s.cardSub}>ملخص هذا الشهر</p>
        </div>
        <a href={hasAccess ? "/dashboard/daftari" : "/pricing"} className={s.more}>
          {hasAccess ? "افتح دفاتري" : "رقّ للتفعيل"}
        </a>
      </div>
      <div className={s.cardBody}>
        {!hasAccess && (
          <p className={s.muted} style={{ margin: 0 }}>
            متاحة من باقة بسطة مارت نمو فما فوق — تتبّع مبيعاتك ومصروفاتك وأرباحك بسهولة
          </p>
        )}
        {hasAccess && loading && <p className={s.muted} style={{ margin: 0 }} role="status">جاري التحميل...</p>}
        {hasAccess && !loading && summary && (
          <div className={s.mini}>
            <MiniStat label="مبيعات الشهر" value={`${summary.income} ر.س`} color="var(--ui-green)" />
            <MiniStat label="مصروفات الشهر" value={`${summary.expenses} ر.س`} color="var(--ui-danger)" />
            <MiniStat label="صافي الربح" value={`${summary.netProfit} ر.س`} color="var(--ui-green-deep)" />
          </div>
        )}
      </div>
    </section>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={s.miniItem}>
      <span className={s.miniLabel}>{label}</span>
      <span className={s.miniValue} style={{ color }}>{value}</span>
    </div>
  );
}
