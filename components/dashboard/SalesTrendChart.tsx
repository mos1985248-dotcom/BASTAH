// components/dashboard/SalesTrendChart.tsx
// الحساب (المقياس والمسار) كما كان؛ التغيير في الألوان والتخطيط. الحالة الفارغة صادقة.
"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./home.module.css";

export interface SalesPoint {
  date: string;
  total: number;
}

const WEEKDAY_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function SalesTrendChart({ data }: { data: SalesPoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 640;
  const height = 240;
  const paddingX = 34;
  const paddingTop = 28;
  const paddingBottom = 32;

  const safeData = Array.isArray(data) ? data : [];
  const max = Math.max(...safeData.map((i) => (Number.isFinite(i.total) ? i.total : 0)), 1);
  const hasSales = safeData.some((i) => Number.isFinite(i.total) && i.total > 0);
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  const points = safeData.map((item, index) => {
    const ratio = safeData.length > 1 ? index / (safeData.length - 1) : 0.5;
    const total = Math.max(Number(item.total) || 0, 0);
    return {
      x: paddingX + ratio * chartWidth,
      y: paddingTop + chartHeight - (total / max) * chartHeight,
      total,
      date: item.date,
    };
  });
  const pathD = points.length ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") : "";
  const baseY = height - paddingBottom;
  const areaD = points.length ? `${pathD} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z` : "";

  return (
    <section className={s.card} style={uiVars} aria-labelledby="sales-chart-title">
      <div className={s.cardHead}>
        <div>
          <h2 id="sales-chart-title" className={s.cardTitle}>المبيعات خلال آخر 7 أيام</h2>
          <p className={s.cardSub}>متابعة أداء المبيعات اليومية</p>
        </div>
        <span className={s.pill}>7 أيام</span>
      </div>

      {!hasSales ? (
        <div className={s.empty}>
          <TrendingUp size={32} strokeWidth={1.5} aria-hidden="true" />
          <p className={s.emptyTitle}>لا توجد مبيعات مسجّلة هذا الأسبوع</p>
          <p className={s.emptyText}>ستظهر حركة المبيعات هنا عند تسجيل الطلبات.</p>
        </div>
      ) : (
        <div className={s.chartWrap}>
          <svg viewBox={`0 0 ${width} ${height}`} className={s.chart} role="img" aria-label="مخطط المبيعات خلال آخر 7 أيام" onMouseLeave={() => setHoverIdx(null)}>
            <defs>
              <linearGradient id="basita-sales-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ui-green)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--ui-green)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((r) => (
              <line key={r} x1={paddingX} x2={width - paddingX} y1={paddingTop + chartHeight * r} y2={paddingTop + chartHeight * r} stroke="var(--ui-border)" strokeDasharray="4 5" />
            ))}
            <path d={areaD} fill="url(#basita-sales-area)" />
            <path d={pathD} fill="none" stroke="var(--ui-green)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => {
              const hovered = hoverIdx === i;
              const day = WEEKDAY_AR[new Date(p.date).getDay()] ?? "";
              return (
                <g key={p.date + i} onMouseEnter={() => setHoverIdx(i)}>
                  <rect x={p.x - 28} y={0} width={56} height={height} fill="transparent" />
                  {hovered && <line x1={p.x} x2={p.x} y1={paddingTop} y2={baseY} stroke="var(--ui-gold)" strokeWidth="1.5" />}
                  <circle cx={p.x} cy={p.y} r={hovered ? 7 : 4.5} fill="var(--ui-card)" stroke="var(--ui-green)" strokeWidth="2.5" />
                  <text x={p.x} y={height - 10} textAnchor="middle" fontSize="12" fill={hovered ? "var(--ui-ink)" : "var(--ui-ink-muted)"} fontWeight={hovered ? 700 : 400}>
                    {day}
                  </text>
                  {hovered && (
                    <g>
                      <rect x={p.x - 42} y={Math.max(p.y - 40, 2)} width={84} height={28} rx={8} fill="var(--ui-green-deep)" />
                      <text x={p.x} y={Math.max(p.y - 40, 2) + 18} textAnchor="middle" fontSize="13" fontWeight={700} fill="var(--ui-white)">
                        {p.total} ر.س
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
