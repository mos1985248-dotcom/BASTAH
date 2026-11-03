// components/dashboard/DashboardHeader.tsx
import { AlertTriangle, CircleCheck, ExternalLink, RefreshCw, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./home.module.css";

type Tone = "ok" | "warn" | "bad" | "off";
const STATUS_LABELS: Record<string, { label: string; tone: Tone; Icon: LucideIcon }> = {
  ACTIVE: { label: "نشط", tone: "ok", Icon: CircleCheck },
  TRIAL: { label: "تجريبي", tone: "ok", Icon: CircleCheck },
  GRACE_PERIOD: { label: "فترة سماح — الاشتراك منتهٍ", tone: "warn", Icon: AlertTriangle },
  SUSPENDED: { label: "معلّق — المنتجات غير ظاهرة", tone: "bad", Icon: AlertTriangle },
  EXPIRED: { label: "منتهي", tone: "bad", Icon: AlertTriangle },
  CANCELLED: { label: "مُلغى", tone: "off", Icon: AlertTriangle },
};
// ألوان النص فقط من متغيرات الواجهة (لا hex)
const TONE_COLOR: Record<Tone, string> = {
  ok: "var(--ui-green)",
  warn: "var(--ui-kicker)",
  bad: "var(--ui-danger)",
  off: "var(--ui-ink-muted)",
};

export default function DashboardHeader({
  storeName,
  storeSlug,
  subscriptionStatus,
}: {
  storeName: string;
  storeSlug: string;
  subscriptionStatus?: string;
}) {
  const status = STATUS_LABELS[subscriptionStatus ?? "ACTIVE"] ?? STATUS_LABELS.ACTIVE;
  const needsAttention =
    subscriptionStatus === "GRACE_PERIOD" || subscriptionStatus === "SUSPENDED" || subscriptionStatus === "EXPIRED";

  return (
    <section className={s.header} style={uiVars} aria-label="متجرك">
      <div>
        <h1 className={s.hName}>{storeName}</h1>
        <a href="/dashboard/subscription" className={s.hStatus} style={{ color: TONE_COLOR[status.tone] }}>
          <status.Icon size={15} strokeWidth={2} aria-hidden="true" />
          {status.label}
        </a>
      </div>
      <div className={s.hActions}>
        {needsAttention && (
          <a href="/pricing" className={`${s.hbtn} ${s.hbtnGold}`}>
            <RefreshCw size={16} strokeWidth={1.9} aria-hidden="true" />
            تجديد الاشتراك
          </a>
        )}
        <a href={`/store/${storeSlug}`} className={s.hbtn}>
          <ExternalLink size={16} strokeWidth={1.9} aria-hidden="true" />
          عرض المتجر
        </a>
      </div>
    </section>
  );
}
