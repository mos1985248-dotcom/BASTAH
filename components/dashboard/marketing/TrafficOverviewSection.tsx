// components/dashboard/marketing/TrafficOverviewSection.tsx
// نظرة عامة + مصادر الزيارات — بيانات حقيقية فقط من AnalyticsEvent. أي قسم
// لم يُبنَ بعد (قمع تحويل كامل، أداء محتوى/حملات مفصَّل) غير معروض هنا
// إطلاقاً بدل وضع "قريباً" لا نهاية له — يُضاف عند بنائه فعلياً.
"use client";

import { useEffect, useState } from "react";
import { Eye, ShoppingCart, Receipt, TrendingUp } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";

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
    <section style={{ marginBottom: t.spacing["6"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing["3"] }}>
        <h2 style={{ margin: 0, fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>نظرة عامة</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              style={{
                padding: "6px 12px", borderRadius: t.radius.full, fontSize: 12, cursor: "pointer", border: "none",
                background: range === r.key ? t.colors.primary[800] : t.colors.cream.bg,
                color: range === r.key ? t.colors.white : t.colors.text.mid,
                fontWeight: range === r.key ? t.typography.fontWeight.bold : 400,
              }}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: t.spacing["2"], marginBottom: t.spacing["3"] }}>
            {cards.map((c) => (
              <div key={c.label} style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["3"] }}>
                <c.Icon size={16} strokeWidth={1.8} color={t.colors.primary[800]} />
                <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{c.value}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: t.colors.text.mid }}>{c.label}</p>
              </div>
            ))}
            <div style={{ background: t.colors.gold[50], borderRadius: t.radius.lg, border: `1px solid ${t.colors.gold[200]}`, padding: t.spacing["3"] }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[700] }}>{data.overview.revenue.toFixed(0)} ر.س</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: t.colors.text.mid }}>الإيراد المحصَّل</p>
            </div>
          </div>

          <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.dark }}>مصادر الزيارات</h3>
          {data.sources.length === 0 ? (
            <p style={{ fontSize: 12, color: t.colors.text.mid }}>لا بيانات بعد لهذه الفترة.</p>
          ) : (
            <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "right" }}>
                <thead>
                  <tr style={{ color: t.colors.text.mid, borderBottom: `1px solid ${t.colors.cream.border}` }}>
                    {["المصدر", "زيارات", "طلبات", "إيراد"].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", fontWeight: t.typography.fontWeight.bold }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sources.map((s) => (
                    <tr key={s.source} style={{ borderBottom: `1px solid ${t.colors.cream.border}` }}>
                      <td style={{ padding: "8px 10px", textTransform: "capitalize" }}>{s.source}</td>
                      <td style={{ padding: "8px 10px" }}>{s.visits}</td>
                      <td style={{ padding: "8px 10px" }}>{s.orders}</td>
                      <td style={{ padding: "8px 10px" }}>{s.revenue.toFixed(0)} ر.س</td>
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
