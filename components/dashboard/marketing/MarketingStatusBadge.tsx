// components/dashboard/marketing/MarketingStatusBadge.tsx
import f from "../forms.module.css";

const STATUS: Record<string, { label: string; tone: "pillWarn" | "pillOff" | "pillOk" | "pillBad" }> = {
  DRAFT: { label: "مسودة", tone: "pillWarn" },
  PENDING_CONNECTION: { label: "بانتظار الربط", tone: "pillOff" },
  PUBLISHED: { label: "أُرسل للنشر", tone: "pillOk" },
  FAILED: { label: "فشل النشر", tone: "pillBad" },
};

export default function MarketingStatusBadge({ status }: { status: string }) {
  const current = STATUS[status] ?? STATUS.DRAFT;
  return <span className={`${f.pill} ${f[current.tone]}`}>{current.label}</span>;
}
