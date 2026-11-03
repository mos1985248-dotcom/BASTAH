// components/dashboard/marketing/TrafficOverviewSection.tsx
// نظرة عامة + مصادر الزيارات — بيانات حقيقية فقط من AnalyticsEvent. أي قسم
// لم يُبنَ بعد (قمع تحويل كامل، أداء محتوى/حملات مفصَّل) غير معروض هنا
// إطلاقاً بدل وضع "قريباً" لا نهاية له — يُضاف عند بنائه فعلياً.
"use client";

import { useEffect, useState } from "react";
import { Eye, ShoppingCart, Receipt, TrendingUp } from "lucide-react";
import { api } from "@/lib/api-client";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import s from "./marketing.module.css";

interface Overview {
  views: number; productClicks: number; addToCart: number; checkoutStarted: number;
  orders: number; revenue: number; conversionRate: number;
}
interface SourceRow { source: string; visits: number; orders: number; revenue: number }
interface Response { overview: Overview; sources: SourceRow[] }

const RANGES: { key: string; label: string }[] = [
  { key: "today", label: "اليوم" },
  { key: "7d", label: "٧ أيام" },
  { key: "30d", label: "٣٠ يوماً" },
];

export default function TrafficOverviewSection() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");

  const load = (r: string) => {
    setError("");
    setData(null);
    api.get<Response>(`/api/marketing/overview?range=${r}`)
      .then(setData)
      .catch((err) => setError(err.message ?? "تعذّر تحميل التحليلات"));
  };
  useEffect(() => load(range), [range]); // eslint-disable-line react-hooks/exhaustive-deps

  // ⚠️ "نقرات المنتجات" مخفية عمداً: لا نقطة بالكود تُسجّل PRODUCT_CLICK بعد
  // (المُسجَّل فعلياً هو PRODUCT_VIEW عند فتح صفحة المنتج الكاملة) — عرض
  // رقم "0" هنا كان سيوهم أن التتبع مفعَّل وببساطة لا نقرات، بدل أنه غير
  // مُفعَّل إطلاقاً. تُعاد عند ربط أول نقطة تسجيل فعلية لهذا النوع.
  const cards = data
    ? [
        { label: "المشاهدات", value: data.overview.views, Icon: Eye },
        { label: "أُضيف للسلة", value: data.overview.addToCart, Icon: ShoppingCart },
        { label: "الطلبات", value: data.overview.orders, Icon: Receipt },
        { label: "نسبة التحويل", value: `${data.overview.conversionRate}%`, Icon: TrendingUp },
      ]
    : [];

  return (
    <section className={s.sec}>
      <div className={s.head}>
        <h2 className={s.h2}>نظرة عامة</h2>
        <div className={s.ranges} role="group" aria-label="الفترة">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={`${s.range} ${range === r.key ? s.rangeOn : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => load(range)} />}
      {!error && !data && <LoadingState label="جاري تحميل التحليلات..." />}

      {data && (
        <>
          <div className={s.stats}>
            {cards.map((c) => (
              <div key={c.label} className={s.stat}>
                <c.Icon size={17} strokeWidth={1.8} />
                <p className={s.statVal}>{c.value}</p>
                <p className={s.statLbl}>{c.label}</p>
              </div>
            ))}
            <div className={`${s.stat} ${s.statSand}`}>
              <p className={s.statVal}>{data.overview.revenue.toFixed(0)} ر.س</p>
              <p className={s.statLbl}>الإيراد المحصَّل</p>
            </div>
          </div>

          <h3 className={s.h3}>مصادر الزيارات</h3>
          {data.sources.length === 0 ? (
            <p className={s.empty}>لا بيانات بعد لهذه الفترة.</p>
          ) : (
            <div className={s.tableBox}>
              <table className={s.table}>
                <thead>
                  <tr>
                    {["المصدر", "زيارات", "طلبات", "إيراد"].map((h) => (
                      <th key={h} scope="col">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sources.map((src) => (
                    <tr key={src.source}>
                      <td className={s.cap}>{src.source}</td>
                      <td>{src.visits}</td>
                      <td>{src.orders}</td>
                      <td>{src.revenue.toFixed(0)} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
