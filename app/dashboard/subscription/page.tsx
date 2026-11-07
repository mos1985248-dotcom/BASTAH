// app/dashboard/subscription/page.tsx
// المنطق (جلب GET /api/subscription وحالات الاشتراك) كما كان حرفياً؛ التغيير في التخطيط والعرض.
// سجل الفواتير صار قسماً بارزاً بجدول كامل (المرجع، الفترة، المبلغ، تاريخ الإصدار والدفع، الحالة) وإيصال لكل فاتورة مدفوعة.
"use client";
import { formatPlatformCopy } from "@/lib/brand";
import { useEffect, useState } from "react";
import { uiVars } from "@/components/ui/vars";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import CustomDomainCard from "@/components/dashboard/CustomDomainCard";
import PlanSummaryCard from "@/components/dashboard/subscription/PlanSummaryCard";
import InvoicesPanel from "@/components/dashboard/subscription/InvoicesPanel";
import { PLAN_NAMES_AR, SubscriptionInvoice } from "@/components/dashboard/subscription/invoiceFormat";
import s from "@/components/dashboard/forms.module.css";

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
  invoices: SubscriptionInvoice[];
  store: { customDomain: string | null; customDomainEnabled: boolean };
}

const STATUS_LABELS: Record<string, { label: string }> = {
  ACTIVE: { label: "نشط" },
  TRIAL: { label: "تجريبي" },
  GRACE_PERIOD: { label: "فترة سماح" },
  SUSPENDED: { label: "معلَّق" },
  EXPIRED: { label: "منتهٍ" },
  CANCELLED: { label: "مُلغى" },
};

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

  const wrap = (children: React.ReactNode) => <div className={s.page} style={uiVars}>{children}</div>;

  if (error) return wrap(<ErrorState message={error} onRetry={load} />);
  if (!data) return wrap(<LoadingState label="جاري تحميل بيانات الاشتراك..." />);

  const { subscription, invoices } = data;
  const status = STATUS_LABELS[subscription.status] ?? STATUS_LABELS.ACTIVE;
  const needsAttention = subscription.status === "GRACE_PERIOD" || subscription.status === "SUSPENDED" || subscription.status === "EXPIRED";
  const planName = formatPlatformCopy(data.planConfig?.nameAr ?? PLAN_NAMES_AR[subscription.plan] ?? subscription.plan);

  return wrap(
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>الاشتراك والفوترة</h1>
          <p className={s.sub}>باقتك الحالية وسجل فواتير اشتراكك وإيصالاتها</p>
        </div>
      </div>

      <div className={s.layoutPlan}>
        <div className={s.gPlan}>
          <PlanSummaryCard
            planName={planName}
            statusKey={subscription.status}
            statusLabel={status.label}
            needsAttention={needsAttention}
            cycleLabel={subscription.billingCycle === "yearly" ? "سنوية" : "شهرية"}
            pricePerMonth={subscription.pricePerMonth}
            startDate={subscription.startDate}
            endLabel={subscription.status === "GRACE_PERIOD" ? "نهاية فترة السماح" : "تاريخ الانتهاء"}
            endDate={subscription.status === "GRACE_PERIOD" ? subscription.gracePeriodEndsAt : subscription.endDate}
            lastInvoiceHref={invoices.length > 0 ? "#invoices" : undefined}
          />
        </div>
        <div className={s.gInv}>
          <InvoicesPanel invoices={invoices} />
        </div>
        <div className={s.gDomain}>
          <CustomDomainCard
            enabled={data.store.customDomainEnabled}
            currentDomain={data.store.customDomain}
            onSaved={(domain) => setData((d) => (d ? { ...d, store: { ...d.store, customDomain: domain } } : d))}
          />
        </div>
      </div>
    </>,
  );
}
