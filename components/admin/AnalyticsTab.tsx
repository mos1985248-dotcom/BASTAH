"use client";

import { useEffect, useState } from "react";
import { Banknote, CalendarDays, CircleDollarSign, Clock3, CreditCard, Cpu, Package, Store, TrendingDown, WalletCards } from "lucide-react";
import { api } from "@/lib/api-client";
import KpiCard from "./ui/KpiCard";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";
import EmptyState from "./ui/EmptyState";
import styles from "./admin.module.css";

type Analytics = {
  gmv: { thisMonth: number; allTime: number };
  mrr: number;
  arr: number;
  failedPayments: { count: number; amount: number };
  activeSellers: number;
  churnedThisMonth: number;
  orders: { thisMonth: number; pending: number };
  aiCostUsd30d: number;
  planDistribution: { plan: string; count: number }[];
};

const planLabels: Record<string, string> = {
  FREE: "بسطة بداية",
  STARTER: "بسطة نمو",
  GROWTH: "بسطة انطلاق",
  PRO: "بسطة ازدهار",
};
const number = new Intl.NumberFormat("ar-SA");
const money = (value: number) => `${number.format(value ?? 0)} ر.س`;

export default function AnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    api.get<Analytics>("/api/admin/analytics").then(setData).catch(() => setError(true));
  }

  useEffect(load, []);

  if (error) return <ErrorState message="تعذّر تحميل الإحصاءات." onRetry={load} />;
  if (!data) return <LoadingState label="جارٍ تحميل الإحصاءات…" />;

  return (
    <div className={styles.overview}>
      <section className={styles.overviewSection} aria-labelledby="admin-revenue">
        <h2 id="admin-revenue" className={styles.sectionTitle}>الإيرادات</h2>
        <div className={styles.overviewGrid}>
          <KpiCard icon={Banknote} label="قيمة المبيعات هذا الشهر" value={money(data.gmv.thisMonth)} />
          <KpiCard icon={WalletCards} label="إجمالي قيمة المبيعات" value={money(data.gmv.allTime)} />
          <KpiCard icon={CalendarDays} label="إيراد الاشتراكات الشهري" value={money(data.mrr)} tone="success" />
          <KpiCard icon={CircleDollarSign} label="إيراد الاشتراكات السنوي المقدّر" value={money(data.arr)} />
          <KpiCard icon={CreditCard} label="مدفوعات فاشلة" value={number.format(data.failedPayments.count)}
            sub={money(data.failedPayments.amount)} tone="danger" />
        </div>
      </section>
      <section className={styles.overviewSection} aria-labelledby="admin-operations">
        <h2 id="admin-operations" className={styles.sectionTitle}>العمليات</h2>
        <div className={styles.overviewGrid}>
          <KpiCard icon={Store} label="بائعون نشطون" value={number.format(data.activeSellers)} />
          <KpiCard icon={TrendingDown} label="اشتراكات انتهت أو أُلغيت" value={number.format(data.churnedThisMonth)} sub="آخر 30 يومًا" tone="warning" />
          <KpiCard icon={Package} label="طلبات هذا الشهر" value={number.format(data.orders.thisMonth)} />
          <KpiCard icon={Clock3} label="طلبات قيد المتابعة" value={number.format(data.orders.pending)} tone="warning" />
          <KpiCard icon={Cpu} label="تكلفة الذكاء الاصطناعي المقدّرة" value={`$${(data.aiCostUsd30d ?? 0).toFixed(2)}`} sub="آخر 30 يومًا" />
        </div>
      </section>
      <section className={styles.overviewSection} aria-labelledby="admin-plans">
        <h2 id="admin-plans" className={styles.sectionTitle}>توزيع الباقات</h2>
        {data.planDistribution.length ? <div className={styles.overviewGrid}>
          {data.planDistribution.map(plan => <KpiCard key={plan.plan} icon={Store}
            label={planLabels[plan.plan] ?? plan.plan} value={number.format(plan.count)} />)}
        </div> : <EmptyState message="لا توجد اشتراكات نشطة لعرضها." />}
      </section>
    </div>
  );
}
