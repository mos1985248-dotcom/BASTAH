// components/home/PlansSection.tsx
// يعرض الباقات الحقيقية من GET /api/subscription/plans — نفس مصدر
// الحقيقة المستخدَم بصفحة /pricing، بدل ملف plans-data.ts الثابت السابق
// (أُزيل نهائياً لأنه كان مصدر بيانات ثانياً منفصلاً عن السكيما الفعلية).
"use client";

import { useEffect, useState } from "react";
import { Check, X, ArrowLeft } from "lucide-react";
import { t } from "@/theme";
import Skeleton from "@/components/ui/Skeleton";
import type { PlanConfig } from "@/components/pricing/plan-types";

function PlanCardSkeleton() {
  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        border: `1px solid ${t.colors.cream.border}`,
        padding: t.spacing["6"],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: t.spacing["3"],
        height: "100%",
      }}
    >
      <Skeleton width="55%" height={20} />
      <Skeleton width="75%" height={12} />
      <Skeleton width="40%" height={30} style={{ marginTop: 8 }} />
      <div style={{ width: "100%", borderTop: `1px solid ${t.colors.cream.border}`, margin: `${t.spacing["2"]} 0` }} />
      <Skeleton width="90%" height={12} />
      <Skeleton width="80%" height={12} />
      <Skeleton width="85%" height={12} />
    </div>
  );
}

export default function PlansSection() {
  const [plans, setPlans] = useState<PlanConfig[] | null>(null);

  useEffect(() => {
    fetch("/api/subscription/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans))
      .catch(() => setPlans([]));
  }, []);

  const loading = plans === null;

  // إخفاء القسم فقط عند التأكد من عدم وجود باقات (بعد انتهاء التحميل)
  if (!loading && plans.length === 0) return null;

  return (
    <section
      aria-labelledby="plans-heading"
      aria-busy={loading}
      style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]} 0` }}
    >
      {/* عنوان القسم */}
      <div style={{ textAlign: "center", marginBottom: t.spacing["6"] }}>
        <h2 id="plans-heading" style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
          باقات تناسب كل أسرة منتجة
        </h2>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
          بدون عمولة على مبيعاتك مهما كانت باقتك — رسوم اشتراك ثابتة فقط
        </p>
      </div>

      {/* حالة التحميل — هياكل عظمية بدل الفراغ لتفادي قفزات التخطيط */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: t.spacing["5"], alignItems: "stretch" }}>
          {Array.from({ length: 3 }, (_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* شبكة الباقات */}
      {!loading && (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: t.spacing["5"], alignItems: "stretch" }}>
        {plans.map((plan) => (
          <div
            key={plan.plan}
            style={{
              background: t.colors.white,
              borderRadius: t.radius.lg,
              border: `2px solid ${plan.badgeAr ? t.colors.gold[600] : t.colors.cream.border}`,
              padding: t.spacing["6"],
              textAlign: "center",
              position: "relative",
              boxShadow: plan.badgeAr ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              height: "100%", // ضمان تساوي ارتفاع جميع البطاقات تماماً
            }}
          >
            {/* شارة الباقة المميزة */}
            {plan.badgeAr && (
              <span 
                style={{ 
                  position: "absolute", 
                  top: -12, 
                  left: "50%", 
                  transform: "translateX(-50%)", 
                  background: t.colors.gold[600], 
                  color: t.colors.white, 
                  fontSize: 11, 
                  fontWeight: t.typography.fontWeight.bold, 
                  padding: "4px 14px", 
                  borderRadius: t.radius.full,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                }}
              >
                {plan.badgeAr}
              </span>
            )}

            <h3 style={{ margin: `0 0 ${t.spacing["1"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
              {plan.nameAr}
            </h3>
            
            {plan.taglineAr && (
              <p style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, minHeight: 28 }}>
                {plan.taglineAr}
              </p>
            )}

            <p style={{ margin: `0 0 ${t.spacing["4"]}` }}>
              <span style={{ fontSize: t.typography.fontSize["3xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
                {plan.priceMonthly}
              </span>
              <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}> ر.س / شهرياً</span>
            </p>

            <div style={{ borderTop: `1px solid ${t.colors.cream.border}`, margin: `${t.spacing["3"]} 0`, paddingTop: t.spacing["3"] }} />

            {/* قسم الميزات المرن لتوحيد الفراغات داخل البطاقات */}
            <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"], textAlign: "start", flex: 1 }}>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.body, fontWeight: t.typography.fontWeight.medium }}>
                • {plan.maxProducts === null ? "منتجات غير محدودة" : `${plan.maxProducts} منتج كحد أقصى`}
              </p>
              
              <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: plan.hasAIFeatures ? t.colors.semantic.success : t.colors.text.light }}>
                {plan.hasAIFeatures ? <Check size={14} strokeWidth={2.4} /> : <X size={14} strokeWidth={2} />}
                {plan.hasAIFeatures ? "مساعد الذكاء الاصطناعي (منيرة)" : "بدون منيرة"}
              </p>

              <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: plan.hasDaftari ? t.colors.semantic.success : t.colors.text.light }}>
                {plan.hasDaftari ? <Check size={14} strokeWidth={2.4} /> : <X size={14} strokeWidth={2} />}
                {plan.hasDaftari ? "نظام المحاسبة (دفاتري)" : "بدون دفاتري"}
              </p>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* رابط مقارنة الميزات */}
      <div style={{ textAlign: "center", marginTop: t.spacing["6"] }}>
        <a 
          href="/pricing" 
          className="basita-btn-interactive"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.sm, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}
        >
          مقارنة كل الميزات بالتفصيل
          <ArrowLeft size={15} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
        </a>
      </div>
    </section>
  );
}
