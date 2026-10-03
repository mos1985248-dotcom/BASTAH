// components/admin/AuditRow.tsx
// صف واحد بسجل العمليات: العنوان بالعربية + من فعلها + على ماذا + السبب،
// ومنطقة "التفاصيل" القابلة للطيّ فيها كل ما سُجِّل (metadata + المعرّف + IP).
"use client";

import { useState } from "react";
import {
  PauseCircle, PlayCircle, CheckCircle2, XCircle, Gem, CreditCard, Undo2,
  User, Trash2, Banknote, Truck, FileEdit, ChevronDown, ChevronUp, type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";
import { auditTitle, auditMetaLines, TARGET_TYPE_LABEL, ROLE_LABEL } from "@/lib/audit-labels";

const ACTION_ICONS: Record<string, LucideIcon> = {
  STORE_SUSPENDED: PauseCircle,
  STORE_REACTIVATED: PlayCircle,
  STORE_VERIFIED: CheckCircle2,
  STORE_REJECTED: XCircle,
  SUBSCRIPTION_CHANGED: Gem,
  INVOICE_MARKED_PAID: CreditCard,
  REFUND_ISSUED: Undo2,
  USER_ROLE_CHANGED: User,
  USER_SUSPENDED: PauseCircle,
  USER_REACTIVATED: PlayCircle,
  PRODUCT_REMOVED: Trash2,
  PAYOUT_PROCESSED: Banknote,
  SHIPPING_PROVIDER_ADDED: Truck,
};

export interface AuditLogRow {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { name: string; email: string; role: string } | null;
  target: { name: string; sub?: string } | null;
}

const small = { margin: 0, fontSize: 10, lineHeight: 1.7, wordBreak: "break-word" as const };

export default function AuditRow({ log }: { log: AuditLogRow }) {
  const [open, setOpen] = useState(false);
  const Icon = ACTION_ICONS[log.action] ?? FileEdit;
  const lines = auditMetaLines(log.metadata);
  const reason = lines.find((l) => l.label === "السبب");
  const targetKind = TARGET_TYPE_LABEL[log.targetType] ?? log.targetType;

  return (
    <div style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.colors.cream.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={17} strokeWidth={1.8} color={t.colors.primary[800]} />
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: "1px 0 4px", fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark, lineHeight: 1.5 }}>
          {auditTitle(log.action, log.metadata)}
        </p>

        <p style={{ ...small, color: t.colors.text.mid }}>
          بواسطة: <strong style={{ color: t.colors.text.dark }}>{log.actor?.name ?? "—"}</strong>
          {log.actor && ` (${ROLE_LABEL[log.actor.role] ?? log.actor.role})`}
        </p>

        <p style={{ ...small, color: t.colors.text.mid }}>
          {targetKind}:{" "}
          {log.target ? (
            <>
              <strong style={{ color: t.colors.text.dark }}>{log.target.name}</strong>
              {log.target.sub && <span dir="ltr" style={{ color: t.colors.text.light }}> · {log.target.sub}</span>}
            </>
          ) : (
            <span style={{ color: t.colors.text.light }}>غير موجود (ربما حُذف)</span>
          )}
        </p>

        {reason && (
          <p style={{ ...small, color: t.colors.semantic.danger, marginTop: 2 }}>السبب: {reason.value}</p>
        )}

        <p style={{ ...small, color: t.colors.text.light, marginTop: 3 }}>
          {new Date(log.createdAt).toLocaleString("ar-SA")}
        </p>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, padding: 0, background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}
        >
          {open ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
          {open ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </button>

        {open && (
          <div style={{ marginTop: 8, padding: 10, background: t.colors.cream.bg, borderRadius: t.radius.md, display: "flex", flexDirection: "column", gap: 3 }}>
            {lines.map((l) => (
              <p key={l.label + l.value} style={{ ...small, color: t.colors.text.mid }}>
                {l.label}: <strong style={{ color: t.colors.text.dark }}>{l.value}</strong>
              </p>
            ))}
            {log.actor?.email && <p style={{ ...small, color: t.colors.text.mid }}>بريد المنفّذ: <span dir="ltr">{log.actor.email}</span></p>}
            {log.ipAddress && <p style={{ ...small, color: t.colors.text.mid }}>عنوان IP: <span dir="ltr">{log.ipAddress}</span></p>}
            <p style={{ ...small, color: t.colors.text.light }}>معرّف الهدف: <span dir="ltr">{log.targetId}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
