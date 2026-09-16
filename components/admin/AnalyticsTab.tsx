// components/admin/AnalyticsTab.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import StatCard from "./StatCard";

export default function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<any>("/api/admin/analytics")
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.colors.text.mid,
          fontSize: t.typography.fontSize.sm,
        }}
      >
        جاري التحميل...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 120,
          padding: "20px",
          borderRadius: t.radius.md,
          background: t.colors.cream.bg,
          border: `1px solid ${t.colors.cream.border}`,
          color: t.colors.semantic.danger,
          fontSize: t.typography.fontSize.sm,
        }}
      >
        <AlertTriangle size={16} strokeWidth={1.8} />
        <span>تعذّر تحميل الإحصاءات، حاول تحديث الصفحة</span>
      </div>
    );
  }

  if (!data) return null;

  const PLAN_COLORS: Record<string, string> = {
    FREE: t.colors.text.light,
    STARTER: t.colors.gold[600],
    GROWTH: t.colors.primary[600],
    PRO: t.colors.primary[800],
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: t.spacing["3"],
  };

  const sectionStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: t.spacing["3"],
  };

  const sectionTitle = {
    margin: 0,
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.bold,
    color: t.colors.text.mid,
    lineHeight: 1.5,
  };

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: t.spacing["5"],
        width: "100%",
      }}
    >
      {/* الإيرادات */}
      <section style={sectionStyle}>
        <h3 style={sectionTitle}>الإيرادات</h3>

        <div style={gridStyle}>
          <StatCard
            label="GMV هذا الشهر"
            value={`${(data.gmv.thisMonth ?? 0).toLocaleString("ar")} ر.س`}
          />

          <StatCard
            label="GMV الكلي"
            value={`${(data.gmv.allTime ?? 0).toLocaleString("ar")} ر.س`}
          />

          <StatCard
            label="MRR"
            value={`${(data.mrr ?? 0).toLocaleString("ar")} ر.س`}
            color={t.colors.semantic.success}
          />

          <StatCard
            label="ARR"
            value={`${(data.arr ?? 0).toLocaleString("ar")} ر.س`}
          />

          <StatCard
            label="مدفوعات فاشلة"
            value={data.failedPayments.count}
            sub={`${(data.failedPayments.amount ?? 0).toFixed(0)} ر.س`}
            color={t.colors.semantic.danger}
          />
        </div>
      </section>

      {/* العمليات */}
      <section style={sectionStyle}>
        <h3 style={sectionTitle}>العمليات</h3>

        <div style={gridStyle}>
          <StatCard
            label="بائعون نشطون"
            value={data.activeSellers}
          />

          <StatCard
            label="انسحبوا (30 يوم)"
            value={data.churnedThisMonth}
            color={t.colors.semantic.warning}
          />

          <StatCard
            label="طلبات هذا الشهر"
            value={data.orders.thisMonth}
          />

          <StatCard
            label="طلبات معلقة"
            value={data.orders.pending}
            color={t.colors.gold[600]}
          />

          <StatCard
            label="تكلفة AI (30 يوم)"
            value={`$${(data.aiCostUsd30d ?? 0).toFixed(2)}`}
            color={t.colors.text.mid}
          />
        </div>
      </section>

      {/* توزيع الباقات */}
      <section style={sectionStyle}>
        <h3 style={sectionTitle}>توزيع الباقات</h3>

        <div
          className="basita-plan-dist-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: t.spacing["3"],
          }}
        >
          {(data.planDistribution ?? []).map((p: any) => (
            <div
              key={p.plan}
              style={{
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.md,
                padding: "14px 12px",
                textAlign: "center",
                minHeight: 82,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
            >
              <p
                style={{
                  margin: "0 0 5px",
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: t.typography.fontWeight.bold,
                  color:
                    PLAN_COLORS[p.plan] ??
                    t.colors.primary[800],
                  lineHeight: 1.2,
                }}
              >
                {p.count}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.text.mid,
                }}
              >
                {p.plan}
              </p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .basita-plan-dist-grid > div:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 700px) {
          .basita-plan-dist-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 480px) {
          .basita-plan-dist-grid {
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

