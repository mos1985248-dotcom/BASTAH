// components/admin/finance/OverviewTab.tsx
import type { SummaryResponse } from "./api-types";
import BreakEvenCard from "./BreakEvenCard";
import FlagsBanner from "./FlagsBanner";
import MonthlyChart from "./MonthlyChart";
import SourcesTable from "./SourcesTable";
import SummaryKpis from "./SummaryKpis";
import { sar } from "./format";
import s from "./finance.module.css";

export default function OverviewTab({ data }: { data: SummaryResponse }) {
  const m = data.summary;
  return (
    <>
      <FlagsBanner flags={m.flags} />
      <SummaryKpis data={data} />
      <div className={s.card}>
        <h2 className={s.h2}>المقارنة الشهرية</h2>
        <p className={s.sub}>المحصَّل فعلاً مقابل المدفوع فعلاً لآخر ستة أشهر (أساس التحصيل).</p>
        <MonthlyChart history={data.history} />
      </div>
      <div className={s.card}>
        <h2 className={s.h2}>مصادر الإيراد</h2>
        <p className={s.sub}>المستحق لبسطة يختلف عن المحصَّل فعلاً. حصة الناقل وقيمة الشحن المارة عبر المنصة ليستا إيراداً.</p>
        <SourcesTable data={data} />
      </div>
      <div className={s.grid2}>
        <div className={s.card}>
          <h2 className={s.h2}>هامش بسطة للشحن</h2>
          <p className={s.sub}>الهامش = قيمة التوصيل − أجر المندوب − التكاليف المباشرة (قيم موثقة فقط).</p>
          <p className={s.num}>قيمة التوصيل: {sar(m.local.deliveryFeeMinor)}</p>
          <p className={s.num}>أجور المناديب: {sar(m.local.courierWagesMinor)}</p>
          <p className={s.num}>تكاليف مباشرة: {sar(m.local.directCostMinor)}</p>
          <p className={`${s.num} ${m.local.marginMinor < 0 ? s.neg : ""}`}><strong>الهامش: {sar(m.local.marginMinor)}</strong></p>
          {m.local.estimatedAtCurrentRates.count > 0 && <p className={s.muted}>تقدير منفصل بالقيم الحالية لـ{m.local.estimatedAtCurrentRates.count} شحنة غير موثقة: {sar(m.local.estimatedAtCurrentRates.marginMinor)} (لا يدخل المجاميع)</p>}
        </div>
        <div className={s.card}>
          <h2 className={s.h2}>الاشتراكات</h2>
          <p className={s.sub}>المبلغ المحصَّل من البطاقة، مع الضريبة المسجّلة منفصلة.</p>
          <p className={s.num}>المحصَّل: {sar(m.subscriptions.paidGrossMinor)}</p>
          <p className={s.num}>قبل الضريبة: {sar(m.subscriptions.preVatMinor)}</p>
          <p className={s.num}>الضريبة المسجّلة: {sar(m.subscriptions.vatRecordedMinor)}</p>
          <p className={s.num}>الاستردادات: {sar(m.subscriptions.refundsMinor)}</p>
          <p className={s.num}>تحصيل سنوي هذا الشهر: {sar(m.subscriptions.yearlyCashMinor)}</p>
          <p className={s.num}>المتكرر الشهري (تقدير): {sar(m.subscriptions.recurringMonthlyEstimateMinor)}</p>
          <p className={s.muted}>{m.subscriptions.byPlan.map((p) => `${data.planNames[p.plan] ?? p.plan}: ${p.count}`).join(" — ") || "لا فواتير مدفوعة"}</p>
        </div>
      </div>
      <BreakEvenCard be={data.breakEven} />
    </>
  );
}
