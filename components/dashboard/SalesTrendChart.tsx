// components/dashboard/SalesTrendChart.tsx
"use client";

import { useState } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { t } from "@/theme";

export interface SalesPoint {
  date: string;
  total: number;
}

const WEEKDAY_AR = [
  "أحد",
  "إثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "سبت",
];

export default function SalesTrendChart({
  data,
}: {
  data: SalesPoint[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 560;
  const height = 220;
  const paddingX = 34;
  const paddingTop = 28;
  const paddingBottom = 32;

  const safeData = Array.isArray(data) ? data : [];

  const max = Math.max(
    ...safeData.map((item) =>
      Number.isFinite(item.total) ? item.total : 0,
    ),
    1,
  );

  const hasSales = safeData.some(
    (item) =>
      Number.isFinite(item.total) &&
      item.total > 0,
  );

  const chartHeight =
    height - paddingTop - paddingBottom;

  const chartWidth =
    width - paddingX * 2;

  const points = safeData.map((item, index) => {
    const ratio =
      safeData.length > 1
        ? index / (safeData.length - 1)
        : 0.5;

    const x =
      paddingX + ratio * chartWidth;

    const total = Math.max(
      Number(item.total) || 0,
      0,
    );

    const y =
      paddingTop +
      chartHeight -
      (total / max) * chartHeight;

    return {
      x,
      y,
      total,
      date: item.date,
    };
  });

  const pathD = points.length
    ? points
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" ")
    : "";

  const areaD =
    points.length > 0
      ? `${pathD}
         L ${points[points.length - 1].x} ${
           height - paddingBottom
         }
         L ${points[0].x} ${
           height - paddingBottom
         }
         Z`
      : "";

  return (
    <section
      className="basita-sales-chart"
      style={{
        background: t.colors.cream.card,
        borderRadius: 18,
        padding: 18,
        border: `1px solid ${t.colors.cream.border}`,
        direction: "rtl",
        boxShadow:
          "0 6px 18px rgba(67,48,29,0.045)",
        minWidth: 0,
      }}
    >
      {/* رأس المخطط */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: t.colors.primary[50],
              border: `1px solid ${t.colors.primary[100]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp
              size={19}
              strokeWidth={1.9}
              color={t.colors.primary[800]}
            />
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontFamily: t.typography.fontFamily.heading,
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.35,
                color: t.colors.primary[800],
              }}
            >
              المبيعات خلال آخر 7 أيام
            </h3>

            <p
              style={{
                margin: "3px 0 0",
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.mid,
                lineHeight: 1.4,
              }}
            >
              متابعة أداء المبيعات اليومية
            </p>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 30,
            padding: "0 9px",
            borderRadius: t.radius.full,
            background: t.colors.cream.warm,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.medium,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <BarChart3
            size={14}
            strokeWidth={1.8}
          />
          7 أيام
        </div>
      </div>

      {!hasSales ? (
        /* الحالة الفارغة */
        <div
          style={{
            minHeight: 190,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            textAlign: "center",
            color: t.colors.text.mid,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: t.colors.cream.warm,
              border: `1px solid ${t.colors.cream.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp
              size={20}
              strokeWidth={1.7}
              color={t.colors.text.light}
            />
          </div>

          <div
            style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.medium,
            }}
          >
            لا توجد مبيعات مسجّلة هذا الأسبوع
          </div>

          <div
            style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.light,
            }}
          >
            ستظهر حركة المبيعات هنا عند تسجيل الطلبات.
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            overflow: "hidden",
          }}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="مخطط المبيعات خلال آخر 7 أيام"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              overflow: "visible",
            }}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient
                id="basita-sales-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={t.colors.primary[600]}
                  stopOpacity="0.20"
                />
                <stop
                  offset="100%"
                  stopColor={t.colors.primary[600]}
                  stopOpacity="0"
                />
              </linearGradient>

              <filter
                id="basita-sales-shadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.12"
                />
              </filter>
            </defs>

            {/* خطوط الشبكة */}
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={width - paddingX}
              y2={paddingTop}
              stroke={t.colors.cream.borderLight}
              strokeDasharray="4 5"
              strokeWidth="1"
            />

            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke={t.colors.cream.borderLight}
              strokeDasharray="4 5"
              strokeWidth="1"
            />

            <line
              x1={paddingX}
              y1={height - paddingBottom}
              x2={width - paddingX}
              y2={height - paddingBottom}
              stroke={t.colors.cream.border}
              strokeWidth="1"
            />

            {/* المنطقة أسفل الخط */}
            <path
              d={areaD}
              fill="url(#basita-sales-fill)"
            />

            {/* الخط الرئيسي */}
            <path
              d={pathD}
              fill="none"
              stroke={t.colors.primary[700]}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#basita-sales-shadow)"
            />

            {points.map((point, index) => {
              const dateObj = new Date(point.date);

              const dayName = !Number.isNaN(
                dateObj.getTime(),
              )
                ? WEEKDAY_AR[dateObj.getDay()]
                : point.date;

              const isHovered =
                hoverIdx === index;

              return (
                <g key={`${point.date}-${index}`}>
                  {/* خط المؤشر */}
                  {isHovered && (
                    <line
                      x1={point.x}
                      y1={paddingTop}
                      x2={point.x}
                      y2={height - paddingBottom}
                      stroke={t.colors.gold[600]}
                      strokeDasharray="3 3"
                      strokeWidth="1"
                      opacity="0.8"
                    />
                  )}

                  {/* نقطة البيانات */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? 7 : 4.5}
                    fill={t.colors.white}
                    stroke={
                      isHovered
                        ? t.colors.gold[600]
                        : t.colors.primary[800]
                    }
                    strokeWidth={
                      isHovered ? 3 : 2
                    }
                    style={{
                      cursor: "pointer",
                      transition:
                        "r 150ms ease, stroke 150ms ease",
                    }}
                    onMouseEnter={() =>
                      setHoverIdx(index)
                    }
                  />

                  {/* اسم اليوم */}
                  <text
                    x={point.x}
                    y={height - 9}
                    textAnchor="middle"
                    fontSize="11"
                    fill={t.colors.text.mid}
                    fontWeight={
                      isHovered ? "700" : "400"
                    }
                  >
                    {dayName}
                  </text>

                  {/* Tooltip */}
                  {isHovered && (
                    <g
                      transform={`translate(${point.x}, ${
                        Math.max(
                          point.y - 14,
                          30,
                        )
                      })`}
                    >
                      <rect
                        x="-42"
                        y="-18"
                        width="84"
                        height="23"
                        rx="7"
                        fill={t.colors.primary[950]}
                      />

                      <text
                        x="0"
                        y="-3"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill={t.colors.white}
                        direction="ltr"
                      >
                        {point.total} ر.س
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