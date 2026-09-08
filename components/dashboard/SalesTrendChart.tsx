// components/dashboard/SalesTrendChart.tsx
"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { t } from "@/theme";

export interface SalesPoint { date: string; total: number }

const WEEKDAY_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function SalesTrendChart({ data }: { data: SalesPoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 560;
  const height = 200;
  const padding = 32;
  const max = Math.max(...data.map((d) => d.total), 1);

  // For proper RTL chart flow (latest or oldest on right/left), 
  // we map points normally based on index order.
  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (d.total / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`;

  const hasSales = data.some((d) => d.total > 0);

  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        padding: t.spacing["5"],
        border: `1px solid ${t.colors.cream.border}`,
        direction: "rtl",
        boxShadow: t.shadows.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["4"] }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          <div style={{ width: 32, height: 32, borderRadius: t.radius.full, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={17} strokeWidth={1.8} color={t.colors.primary[800]} />
          </div>
          المبيعات خلال آخر 7 أيام
        </h3>
      </div>

      {!hasSales ? (
        <div style={{ textAlign: "center", padding: `${t.spacing["8"]} 0`, color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>
          لا توجد مبيعات مسجّلة هذا الأسبوع بعد
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", overflow: "visible" }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="basita-sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.colors.primary[600]} stopOpacity="0.25" />
              <stop offset="100%" stopColor={t.colors.primary[600]} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={t.colors.cream.border} strokeDasharray="4 4" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={t.colors.cream.border} strokeDasharray="4 4" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={t.colors.cream.border} strokeWidth="1" />

          <path d={areaD} fill="url(#basita-sales-fill)" />
          <path d={pathD} fill="none" stroke={t.colors.primary[700]} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => {
            const dateObj = new Date(p.date);
            const dayName = !isNaN(dateObj.getTime()) ? WEEKDAY_AR[dateObj.getDay()] : p.date;

            return (
              <g key={p.date}>
                {hoverIdx === i && (
                  <line x1={p.x} y1={padding} x2={p.x} y2={height - padding} stroke={t.colors.primary[300]} strokeDasharray="2 2" strokeWidth="1" />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverIdx === i ? 7 : 4.5}
                  fill={t.colors.white}
                  stroke={t.colors.primary[800]}
                  strokeWidth={hoverIdx === i ? 3 : 2}
                  style={{ cursor: "pointer", transition: `all ${t.motion.fast} ${t.motion.ease}` }}
                  onMouseEnter={() => setHoverIdx(i)}
                />
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill={t.colors.text.mid}
                  fontWeight={hoverIdx === i ? "bold" : "normal"}
                >
                  {dayName}
                </text>
                {hoverIdx === i && (
                  <g transform={`translate(${p.x}, ${p.y - 14})`}>
                    <rect x="-35" y="-18" width="70" height="22" rx="4" fill={t.colors.primary[900]} />
                    <text x="0" y="-4" textAnchor="middle" fontSize="11" fontWeight="bold" fill={t.colors.white} direction="ltr">
                      {p.total} ر.س
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}