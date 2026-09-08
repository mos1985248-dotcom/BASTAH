// components/dashboard/DaftariDashboardCard.tsx
"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";

interface MonthSummary { income: number; expenses: number; refunds: number; netProfit: number }

export default function DaftariDashboardCard({ plan }: { plan: string }) {
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const hasAccess = plan !== "FREE";

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    api
      .get<{ monthSummary: MonthSummary }>("/api/daftari/entries?limit=1")
      .then((d) => setSummary(d.monthSummary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hasAccess]);

  return (
    <div style={{ background: t.colors.cream?.warm || "#fdfbf7", borderRadius: t.radius.lg, padding: t.spacing["5"], border: `1px solid ${t.colors.cream.border}`, boxShadow: t.shadows.sm, direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing["4"] }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          <div style={{ width: 32, height: 32, borderRadius: t.radius.full, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={17} strokeWidth={1.8} color={t.colors.primary[800]} />
          </div>
          دفاتري — محاسبة بسيطة
        </h3>
        {hasAccess ? (
          <a
            href="/dashboard/daftari"
            className="basita-btn-interactive"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: t.colors.primary[800],
              color: t.colors.white,
              borderRadius: t.radius.full,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              textDecoration: "none",
              boxShadow: t.shadows.sm,
            }}
          >
            افتح دفاتري
            <ArrowRight size={14} strokeWidth={2} />
          </a>
        ) : (
          <a
            href="/pricing"
            className="basita-btn-interactive"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: t.colors.gold[600],
              color: t.colors.white,
              borderRadius: t.radius.full,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              textDecoration: "none",
              boxShadow: t.shadows.sm,
            }}
          >
            رقّي للتفعيل
            <ArrowRight size={14} strokeWidth={2} />
          </a>
        )}
      </div>

      {!hasAccess && (
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
          متاحة من باقة بسطة نمو فما فوق — تتبّعي مبيعاتك ومصروفاتك وأرباحك بسهولة
        </p>
      )}
      {hasAccess && loading && <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>جاري التحميل...</p>}
      {hasAccess && !loading && summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: t.spacing["3"] }}>
          <MiniStat label="مبيعات الشهر" value={`${summary.income} ر.س`} color={t.colors.semantic.success} />
          <MiniStat label="مصروفات الشهر" value={`${summary.expenses} ر.س`} color={t.colors.semantic.danger} />
          <MiniStat label="صافي الربح" value={`${summary.netProfit} ر.س`} color={t.colors.primary[800]} />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: "center", background: t.colors.white, padding: "12px 8px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}` }}>
      <p style={{ margin: "0 0 4px", fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium }}>{label}</p>
    </div>
  );
}