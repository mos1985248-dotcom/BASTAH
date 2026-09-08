// app/dashboard/subscription/page.tsx
// نقطة الدخول التي كانت ناقصة — يستخدم GET /api/subscription الجاهز
// أصلاً بلا أي تعديل عليه. عرض فقط، أي تغيير باقة يمر عبر /pricing.
"use client";

import { useEffect, useState } from "react";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import StatusBadge from "@/components/admin/ui/StatusBadge";

interface SubscriptionData {
  subscription: {
    plan: string;
    status: string;
    billingCycle: string;
    startDate: string | null;
    endDate: string | null;
    gracePeriodEndsAt: string | null;
    suspendedAt: string | null;
    pricePerMonth: number;
  };
  planConfig: { nameAr: string } | null;
  invoices: {
    id: string;
    plan: string;
    billingCycle: string;
    amount: number;
    status: string;
    periodYear: number;
    periodMonth: number;
    paidAt: string | null;
    createdAt: string;
  }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "نشط", color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  TRIAL: { label: "تجريبي", color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  GRACE_PERIOD: { label: "فترة سماح", color: t.colors.gold[700], bg: t.colors.gold[100] },
  SUSPENDED: { label: "معلَّق", color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  EXPIRED: { label: "منتهٍ", color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  CANCELLED: { label: "مُلغى", color: t.colors.text.light, bg: t.colors.cream.warm },
};

const INVOICE_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PAID: { label: "مدفوعة", color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  PENDING: { label: "بانتظار الدفع", color: t.colors.gold[700], bg: t.colors.gold[100] },
  FAILED: { label: "فشلت", color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
};

const PLAN_NAMES_AR: Record<string, string> = { FREE: "بسطة بداية", STARTER: "بسطة نمو", GROWTH: "بسطة انطلاق", PRO: "بسطة ازدهار" };

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    fetch("/api/subscription")
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) throw new Error(body?.error ?? "تعذّر تحميل بيانات الاشتراك");
        setData(body);
      })
      .catch((err) => setError(err.message ?? "تعذّر تحميل بيانات الاشتراك"));
  };

  useEffect(load, []);

  if (error) return <div style={{ padding: t.spacing["4"] }}><ErrorState message={error} onRetry={load} /></div>;
  if (!data) return <LoadingState label="جاري تحميل بيانات الاشتراك..." />;

  const { subscription, invoices } = data;
  const status = STATUS_LABELS[subscription.status] ?? STATUS_LABELS.ACTIVE;
  const needsAttention = subscription.status === "GRACE_PERIOD" || subscription.status === "SUSPENDED" || subscription.status === "EXPIRED";
  const planName = data.planConfig?.nameAr ?? PLAN_NAMES_AR[subscription.plan] ?? subscription.plan;

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], margin: `0 0 ${t.spacing["4"]}` }}>الاشتراك والفوترة</h1>

        <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["5"], marginBottom: t.spacing["5"] }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing["3"], flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: t.colors.text.light }}>باقتك الحالية</p>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{planName}</p>
            </div>
            <StatusBadge label={status.label} color={status.color} bg={status.bg} />
          </div>

          {needsAttention && (
            <div style={{ background: t.colors.semantic.dangerBg, borderRadius: t.radius.md, padding: t.spacing["3"], marginBottom: t.spacing["4"] }}>
              <p style={{ margin: 0, fontSize: 13, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.bold }}>
                {subscription.status === "SUSPENDED"
                  ? "متجرك معلَّق حالياً — منتجاتك غير ظاهرة للعملاء. جدّدي اشتراكك لإعادة التفعيل فوراً."
                  : "اشتراكك بحاجة للتجديد لتفادي تعليق متجرك."}
              </p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["3"], marginBottom: t.spacing["4"] }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>دورة الفوترة</p>
              <p style={{ margin: 0, fontSize: 13, color: t.colors.text.body }}>{subscription.billingCycle === "yearly" ? "سنوية" : "شهرية"}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>السعر</p>
              <p style={{ margin: 0, fontSize: 13, color: t.colors.text.body }}>{subscription.pricePerMonth} ر.س / شهرياً</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>بداية الاشتراك</p>
              <p style={{ margin: 0, fontSize: 13, color: t.colors.text.body }}>{formatDate(subscription.startDate)}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>{subscription.status === "GRACE_PERIOD" ? "نهاية فترة السماح" : "تاريخ الانتهاء"}</p>
              <p style={{ margin: 0, fontSize: 13, color: t.colors.text.body }}>
                {formatDate(subscription.status === "GRACE_PERIOD" ? subscription.gracePeriodEndsAt : subscription.endDate)}
              </p>
            </div>
          </div>

          <a
            href="/pricing"
            style={{ display: "block", textAlign: "center", padding: 12, background: t.colors.primary[800], color: t.colors.white, borderRadius: t.radius.md, textDecoration: "none", fontWeight: t.typography.fontWeight.bold, fontSize: 14 }}
          >
            {needsAttention ? "تجديد الاشتراك الآن" : "تغيير الباقة"}
          </a>
        </div>

        <h2 style={{ fontSize: t.typography.fontSize.base, color: t.colors.text.dark, margin: `0 0 ${t.spacing["2"]}` }}>سجل الفواتير</h2>

        {invoices.length === 0 ? (
          <p style={{ fontSize: 13, color: t.colors.text.light }}>لا توجد فواتير بعد</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
            {invoices.map((inv) => {
              const invStatus = INVOICE_STATUS_LABELS[inv.status] ?? INVOICE_STATUS_LABELS.PENDING;
              return (
                <div key={inv.id} style={{ background: t.colors.white, borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["3"], display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
                      {PLAN_NAMES_AR[inv.plan] ?? inv.plan} — {inv.periodMonth}/{inv.periodYear}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: t.colors.text.light }}>{inv.amount} ر.س · {inv.billingCycle === "yearly" ? "سنوي" : "شهري"}</p>
                  </div>
                  <StatusBadge label={invStatus.label} color={invStatus.color} bg={invStatus.bg} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
