// components/admin/AuditTab.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Gem,
  CreditCard,
  Undo2,
  User,
  Trash2,
  Banknote,
  FileEdit,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";

const ACTION_ICONS: Record<string, LucideIcon> = {
  STORE_SUSPENDED: PauseCircle, STORE_REACTIVATED: PlayCircle, STORE_VERIFIED: CheckCircle2, STORE_REJECTED: XCircle,
  SUBSCRIPTION_CHANGED: Gem, INVOICE_MARKED_PAID: CreditCard, REFUND_ISSUED: Undo2,
  USER_ROLE_CHANGED: User, PRODUCT_REMOVED: Trash2, PAYOUT_PROCESSED: Banknote,
};

export default function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<any>("/api/admin/audit-log?limit=50").then((d) => setLogs(d.logs)).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>جاري التحميل...</p>;
  if (error) return (
    <p style={{ color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs, display: "flex", alignItems: "center", gap: 6 }}>
      <AlertTriangle size={14} strokeWidth={1.8} />
      تعذّر تحميل سجل العمليات
    </p>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["1"] }}>
      {logs.length === 0 && <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>لا توجد سجلات بعد</p>}
      {logs.map((l) => {
        const Icon = ACTION_ICONS[l.action] ?? FileEdit;
        return (
          <div key={l.id} style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "10px 14px", border: `1px solid ${t.colors.cream.border}`, display: "flex", gap: t.spacing["2"] }}>
            <Icon size={18} strokeWidth={1.7} color={t.colors.primary[800]} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
                {l.action.replace(/_/g, " ")}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>
                {l.actor?.name} · {l.targetType} {l.targetId.slice(0, 8)}... · {new Date(l.createdAt).toLocaleString("ar-SA")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
