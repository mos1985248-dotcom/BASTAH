// components/dashboard/subscription/invoiceFormat.ts
// تنسيق الفواتير: تواريخ ميلادية (ar-SA الافتراضي هجري) وأسماء الباقات والحالات.
export interface SubscriptionInvoice {
  id: string;
  plan: string;
  billingCycle: string;
  amount: number;
  status: string;
  periodYear: number;
  periodMonth: number;
  paidAt: string | null;
  createdAt: string;
  dueDate?: string | null;
  moyasarTxnId?: string | null;
  vatRate?: number | null;
  vatAmount?: number | null;
}

export const PLAN_NAMES_AR: Record<string, string> = { FREE: "بسطة بداية", STARTER: "بسطة نمو", GROWTH: "بسطة انطلاق", PRO: "بسطة ازدهار" };
export const INVOICE_STATUS: Record<string, { label: string; tone: "ok" | "warn" | "bad" | "off" }> = {
  PAID: { label: "مدفوعة", tone: "ok" },
  PENDING: { label: "بانتظار الدفع", tone: "warn" },
  FAILED: { label: "فشلت", tone: "bad" },
};

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { year: "numeric", month: "long", day: "numeric" }) : "—";

export const fmtPeriod = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("ar-SA-u-ca-gregory", { year: "numeric", month: "long" });

// مرجع قصير للفاتورة (آخر 8 خانات من المعرّف) — ليس رقماً ضريبياً رسمياً
export const invoiceRef = (id: string) => `INV-${id.slice(-8).toUpperCase()}`;

export const cycleLabel = (c: string) => (c === "yearly" ? "سنوي" : "شهري");
