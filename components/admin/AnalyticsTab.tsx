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
    api.get<any>("/api/admin/analytics").then(setData).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: t.colors.text.mid }}>جاري التحميل...</p>;
  if (error) return (
    <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger }}>
      <AlertTriangle size={14} strokeWidth={1.8} />
      تعذّر تحميل الإحصاءات، حاول تحديث الصفحة
    </p>
  );
  if (!data) return null;

  const PLAN_COLORS: Record<string, string> = { FREE: t.colors.text.light, STARTER: t.colors.gold[600], GROWTH: t.colors.primary[600], PRO: t.colors.primary[800] };
  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: t.spacing["2"] };
  const sectionTitle = { margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
      <h3 style={sectionTitle}>الإيرادات</h3>
      <div style={gridStyle}>
        <StatCard label="GMV هذا الشهر" value={`${(data.gmv.thisMonth ?? 0).toLocaleString("ar")} ر.س`} />
        <StatCard label="GMV الكلي" value={`${(data.gmv.allTime ?? 0).toLocaleString("ar")} ر.س`} />
        <StatCard label="MRR" value={`${(data.mrr ?? 0).toLocaleString("ar")} ر.س`} color={t.colors.semantic.success} />
        <StatCard label="ARR" value={`${(data.arr ?? 0).toLocaleString("ar")} ر.س`} />
        <StatCard label="مدفوعات فاشلة" value={data.failedPayments.count} sub={`${(data.failedPayments.amount ?? 0).toFixed(0)} ر.س`} color={t.colors.semantic.danger} />
      </div>

      <h3 style={sectionTitle}>العمليات</h3>
      <div style={gridStyle}>
        <StatCard label="بائعون نشطون" value={data.activeSellers} />
        <StatCard label="انسحبوا (30 يوم)" value={data.churnedThisMonth} color={t.colors.semantic.warning} />
        <StatCard label="طلبات هذا الشهر" value={data.orders.thisMonth} />
        <StatCard label="طلبات معلقة" value={data.orders.pending} color={t.colors.gold[600]} />
        <StatCard label="تكلفة AI (30 يوم)" value={`$${(data.aiCostUsd30d ?? 0).toFixed(2)}`} color={t.colors.text.mid} />
      </div>

      <h3 style={sectionTitle}>توزيع الباقات</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: t.spacing["2"] }} className="basita-plan-dist-grid">
        {(data.planDistribution ?? []).map((p: any) => (
          <div key={p.plan} style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: "10px 12px", textAlign: "center" }}>
            <p style={{ margin: "0 0 3px", fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: PLAN_COLORS[p.plan] ?? t.colors.primary[800] }}>{p.count}</p>
            <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>{p.plan}</p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 480px) {
          .basita-plan-dist-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
