// components/pricing/PricingCard.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { t } from "@/theme";
import type { PlanConfig } from "./plan-types";
import { useCurrentUser } from "@/app/providers";

export default function PricingCard({ plan, billing }: { plan: PlanConfig; billing: "monthly" | "yearly" }) {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const displayPrice = billing === "yearly" ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;
  const highlighted = Boolean(plan.badgeAr);

  const hasOwnStore = Boolean(user?.store);

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.plan, billingCycle: billing }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "تعذّر تنفيذ العملية");

      if (body.requiresPayment) {
        window.location.href = body.paymentUrl;
      } else {
        window.location.href = "/dashboard?planChanged=1";
      }
    } catch (err: any) {
      setError(err.message ?? "تعذّر تنفيذ العملية");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.xl,
        border: `2px solid ${highlighted ? t.colors.gold[600] : t.colors.cream.border}`,
        padding: t.spacing["6"],
        position: "relative",
        boxShadow: highlighted ? t.shadows.gold : t.shadows.xs,
        direction: "rtl",
        textAlign: "right",
        display: "flex",
        flexDirection: "column",
        height: "100%", // ضمان ملء الارتفاع المتاح بالكامل داخل الحاوية المرنة
      }}
    >
      {plan.badgeAr && (
        <span
          style={{
            position: "absolute",
            top: -14,
            right: "50%",
            transform: "translateX(50%)",
            background: t.colors.gold[600],
            color: t.colors.text.onDark,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            padding: "4px 14px",
            borderRadius: t.radius.full,
            boxShadow: t.shadows.sm,
            whiteSpace: "nowrap",
          }}
        >
          {plan.badgeAr}
        </span>
      )}

      <h3 style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
        {plan.nameAr}
      </h3>
      
      <div style={{ minHeight: 40, marginBottom: t.spacing["4"] }}>
        {plan.taglineAr && (
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium }}>
            {plan.taglineAr}
          </p>
        )}
      </div>

      <div style={{ margin: `0 0 ${t.spacing["5"]}`, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
          {displayPrice}
        </span>
        <span style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium }}>ريال / شهرياً</span>
      </div>

      <div style={{ marginBottom: t.spacing["5"] }}>
        {hasOwnStore ? (
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="basita-btn-interactive"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              padding: "12px",
              borderRadius: t.radius.md,
              border: "none",
              background: highlighted ? t.colors.primary[800] : t.colors.primary[100],
              color: highlighted ? t.colors.text.onDark : t.colors.primary[800],
              fontWeight: t.typography.fontWeight.bold,
              fontSize: t.typography.fontSize.sm,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: t.shadows.sm,
            }}
          >
            {loading ? "جاري التحويل..." : "اختيار هذه الباقة"}
          </button>
        ) : (
          <a
            href={user ? "/dashboard/create-store" : "/register"}
            className="basita-btn-interactive"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              textAlign: "center",
              padding: "12px",
              borderRadius: t.radius.md,
              background: highlighted ? t.colors.primary[800] : t.colors.primary[100],
              color: highlighted ? t.colors.text.onDark : t.colors.primary[800],
              fontWeight: t.typography.fontWeight.bold,
              fontSize: t.typography.fontSize.sm,
              textDecoration: "none",
              boxShadow: t.shadows.sm,
            }}
          >
            {user ? "أنشئي متجرك الآن" : plan.priceMonthly === 0 ? "ابدأي مجاناً" : "اشتركي الآن"}
          </a>
        )}
      </div>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.bold }}>
          <AlertTriangle size={14} strokeWidth={1.8} />
          {error}
        </p>
      )}

      {/* قائمة المميزات تأخذ المساحة المتبقية لدفع الزر إلى الأسفل وجعل البطاقات متساوية */}
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"], flex: 1, justifyContent: "flex-start" }}>
        {plan.featuresAr.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: t.spacing["2"], fontSize: t.typography.fontSize.sm, color: t.colors.text.body, fontWeight: t.typography.fontWeight.medium }}>
            <Check size={16} strokeWidth={2.2} color={t.colors.semantic.success} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}