// components/admin/finance/SummaryKpis.tsx — مؤشرات الشهر. كل رقم من مصدره الفعلي ويُميَّز تقديره.
import { Banknote, Boxes, CreditCard, HandCoins, Scale, Truck, UserCheck, Wallet, Bot, Receipt, TrendingUp, Landmark } from "lucide-react";
import KpiCard from "@/components/admin/ui/KpiCard";
import type { SummaryResponse } from "./api-types";
import { pct, sar } from "./format";
import s from "./finance.module.css";

function delta(cur: number | null, prev: number | null): string | undefined {
  if (cur === null || prev === null || prev === 0) return undefined;
  const d = ((cur - prev) / Math.abs(prev)) * 100;
  return `${d >= 0 ? "▲" : "▼"} ${pct(Math.abs(d))} عن الشهر السابق`;
}

export default function SummaryKpis({ data }: { data: SummaryResponse }) {
  const { summary: m, history, allTime } = data;
  const prev = history.length >= 2 ? history[history.length - 2] : null;
  const shipments = m.external.eligibleCount + m.local.eligibleCount;
  const netAll = allTime.subscriptionsNetMinor + allTime.receiptsMinor;
  const outAll = allTime.expensesPaidMinor + allTime.courierPayoutsMinor;
  return (
    <>
      <div className={s.kpis}>
        <KpiCard icon={CreditCard} label="إيراد الاشتراكات (صافي المحصَّل)" value={sar(m.subscriptions.netCollectedMinor)} sub={delta(history[history.length - 1]?.cashReceiptsMinor ?? null, prev?.cashReceiptsMinor ?? null) ?? `${m.subscriptions.paidCount} فاتورة مدفوعة`} tone="success" />
        <KpiCard icon={Truck} label="عمولات الشحن الخارجي (مستحقة)" value={sar(m.external.accruedMinor)} sub={`محصَّل ${sar(m.external.receivedMinor)} — متبقٍ ${sar(m.external.outstandingMinor)}`} />
        <KpiCard icon={Boxes} label="هامش بسطة للشحن" value={sar(m.local.marginMinor)} sub={`${m.local.eligibleCount - m.local.undocumentedCount} شحنة موثقة${m.local.undocumentedCount ? ` — ${m.local.undocumentedCount} غير موثقة` : ""}`} tone={m.local.marginMinor < 0 ? "danger" : "default"} />
        <KpiCard icon={HandCoins} label="صافي حصة بسطة من COD" value={sar(m.cod.netShareMinor)} sub={m.cod.incompleteCount ? `${m.cod.incompleteCount} طلب بإعداد تكلفة ناقص` : `${m.cod.eligibleCount} طلب`} tone={m.cod.incompleteCount ? "warning" : "default"} />
        <KpiCard icon={Receipt} label="المصروفات التشغيلية (مدفوعة)" value={sar(m.expenses.operatingPaidMinor)} sub={`مستحقة ${sar(m.expenses.operatingIncurredMinor)} — تأسيس ${sar(m.expenses.establishmentIncurredMinor)}`} />
        <KpiCard icon={Scale} label="نتيجة التشغيل (أساس التحصيل)" value={sar(m.result.operatingResultCashMinor)} sub={delta(m.result.operatingResultCashMinor, prev?.operatingResultCashMinor ?? null) ?? "ليست ربحاً محاسبياً"} tone={m.result.operatingResultCashMinor !== null && m.result.operatingResultCashMinor < 0 ? "danger" : "success"} />
        <KpiCard icon={Wallet} label="صافي التدفق النقدي" value={sar(m.result.netCashFlowMinor)} sub="يشمل التأسيس وشحن رصيد الذكاء الاصطناعي" tone={m.result.netCashFlowMinor !== null && m.result.netCashFlowMinor < 0 ? "danger" : "default"} />
        <KpiCard icon={Banknote} label="مستحقات غير محصَّلة لبسطة" value={sar(m.result.accruedDuesMinor)} sub="تراكمي حتى نهاية الشهر — ليست نقداً" tone="warning" />
        <KpiCard icon={UserCheck} label="التزامات المناديب (المتبقي)" value={sar(m.couriers.balanceMinor)} sub={`مستحق الشهر ${sar(m.couriers.accruedMinor)} — مدفوع ${sar(m.couriers.paidMinor)}`} tone={m.couriers.balanceMinor > 0 ? "warning" : "default"} />
        <KpiCard icon={Bot} label="تكلفة الذكاء الاصطناعي" value={m.ai.costSarMinor === null ? "غير متاح" : sar(m.ai.costSarMinor)} sub={m.ai.source === "DOCUMENTED" ? "موثَّقة (فاتورة المزوّد)" : m.ai.source === "PROVISIONAL" ? "محسوبة مؤقتاً من الاستخدام" : "لا استخدام مسجّل"} tone={m.ai.costSarMinor === null && m.ai.costUsdMicro > 0 ? "danger" : "default"} />
        <KpiCard icon={Truck} label="الشحنات المكتملة" value={shipments} sub={`خارجية ${m.external.eligibleCount} — بسطة ${m.local.eligibleCount}${m.local.failedOrReturned ? ` — فاشلة/مرتجعة ${m.local.failedOrReturned}` : ""}`} />
        <KpiCard icon={TrendingUp} label="التجار المشتركون (مدفوع)" value={m.subscriptions.paidCount} sub={`تجريبي ${m.subscriptions.trialCount} — مجاني ${m.subscriptions.freePlanCount}`} />
      </div>
      <div className={s.kpis}>
        <KpiCard icon={Landmark} label="منذ بداية المشروع: المحصَّل" value={sar(netAll)} sub="اشتراكات (بعد الاستردادات) + تحصيلات مسجّلة" />
        <KpiCard icon={Landmark} label="منذ بداية المشروع: المدفوع" value={sar(outAll)} sub={`مصروفات مدفوعة ${sar(allTime.expensesPaidMinor)} (منها تأسيس ${sar(allTime.establishmentPaidMinor)}) + دفعات مناديب ${sar(allTime.courierPayoutsMinor)}`} />
        <KpiCard icon={Landmark} label="منذ بداية المشروع: الصافي النقدي" value={sar(netAll - outAll)} sub="تحصيل فعلي ناقص مدفوع فعلي (دون مستحقات غير محصّلة)" tone={netAll - outAll < 0 ? "danger" : "success"} />
      </div>
    </>
  );
}
