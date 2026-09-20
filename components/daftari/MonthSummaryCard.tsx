// components/daftari/MonthSummaryCard.tsx

import {
  ArrowDownLeft,
  ArrowUpLeft,
  RotateCcw,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";

export interface MonthSummary {
  income: number;
  expenses: number;
  refunds: number;
  netProfit: number;
}

export default function MonthSummaryCard({
  summary,
}: {
  summary: MonthSummary;
}) {
  const items: {
    label: string;
    value: number;
    color: string;
    Icon: LucideIcon;
  }[] = [
    {
      label: "الدخل",
      value: summary.income,
      color: t.colors.semantic.success,
      Icon: ArrowUpLeft,
    },
    {
      label: "المصروفات",
      value: summary.expenses,
      color: t.colors.semantic.danger,
      Icon: ArrowDownLeft,
    },
    {
      label: "الاسترجاعات",
      value: summary.refunds,
      color: t.colors.semantic.warning,
      Icon: RotateCcw,
    },
  ];

  return (
    <section
      dir="rtl"
      className="basita-month-summary"
      aria-label="ملخص الشهر المالي"
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`,
        borderRadius: t.radius.lg,
        padding: t.spacing["4"],
        boxShadow: "0 6px 18px rgba(35, 27, 18, 0.10)",
      }}
    >
      {/* Decorative elements */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 140,
          height: 140,
          top: -90,
          insetInlineStart: -45,
          borderRadius: t.radius.full,
          background: "rgba(255, 255, 255, 0.035)",
        }}
      />

      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 90,
          height: 90,
          bottom: -55,
          insetInlineEnd: -28,
          borderRadius: t.radius.full,
          background: "rgba(255, 255, 255, 0.025)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Main profit */}
        <div
          className="basita-month-summary-main"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: t.spacing["3"],
            marginBottom: t.spacing["4"],
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: `0 0 ${t.spacing["1"]}`,
                color: t.colors.text.onDarkMuted,
                fontSize: 12,
                fontWeight:
                  t.typography.fontWeight.medium,
                lineHeight: 1.45,
              }}
            >
              <WalletCards
                size={14}
                strokeWidth={1.7}
              />
              صافي الربح هذا الشهر
            </p>

            <p
              style={{
                margin: 0,
                color: t.colors.gold[400],
                fontSize: t.typography.fontSize["2xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {summary.netProfit.toFixed(0)} ر.س
            </p>
          </div>

          <span
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: "rgba(255, 255, 255, 0.07)",
              color: t.colors.gold[400],
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <WalletCards
              size={17}
              strokeWidth={1.6}
            />
          </span>
        </div>

        {/* Financial indicators */}
        <div
          className="basita-month-summary-items"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: t.spacing["2"],
          }}
        >
          {items.map((it) => {
            const Icon = it.Icon;

            return (
              <div
                key={it.label}
                className="basita-month-summary-item"
                style={{
                  minWidth: 0,
                  padding: `${t.spacing["2"]} ${t.spacing["3"]}`,
                  borderRadius: t.radius.md,
                  background: "rgba(255, 255, 255, 0.065)",
                  border:
                    "1px solid rgba(255, 255, 255, 0.07)",
                  transition:
                    "background 160ms ease, transform 160ms ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 23,
                      height: 23,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: t.radius.full,
                      background: `${it.color}22`,
                      color: it.color,
                    }}
                  >
                    <Icon
                      size={12}
                      strokeWidth={2}
                    />
                  </span>

                  <p
                    style={{
                      margin: 0,
                      color: t.colors.text.onDarkMuted,
                      fontSize: 11,
                      lineHeight: 1.35,
                    }}
                  >
                    {it.label}
                  </p>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: t.colors.white,
                    fontSize: t.typography.fontSize.base,
                    fontWeight:
                      t.typography.fontWeight.bold,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.value.toFixed(0)} ر.س
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .basita-month-summary-item:hover {
          background: rgba(255, 255, 255, 0.09);
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .basita-month-summary {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-month-summary-items {
            grid-template-columns: 1fr !important;
          }

          .basita-month-summary-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: ${t.spacing["2"]};
            padding: 8px 10px !important;
          }

          .basita-month-summary-item > div {
            margin-bottom: 0 !important;
          }
        }

        @media (max-width: 400px) {
          .basita-month-summary {
            border-radius: ${t.radius.lg} !important;
            padding: 10px !important;
          }

          .basita-month-summary-main {
            margin-bottom: ${t.spacing["3"]} !important;
          }

          .basita-month-summary-main > span {
            width: 33px !important;
            height: 33px !important;
          }

          .basita-month-summary-main > span svg {
            width: 16px !important;
            height: 16px !important;
          }

          .basita-month-summary-main > div > p:last-child {
            font-size: 22px !important;
          }

          .basita-month-summary-item {
            padding: 7px 9px !important;
          }
        }

        @media (max-width: 340px) {
          .basita-month-summary-main > div > p:first-child {
            font-size: 11px !important;
          }

          .basita-month-summary-main > div > p:last-child {
            font-size: 20px !important;
          }

          .basita-month-summary-item > div > span {
            width: 21px !important;
            height: 21px !important;
          }

          .basita-month-summary-item > p {
            font-size: 13px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-month-summary-item {
            transition: none !important;
          }

          .basita-month-summary-item:hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}