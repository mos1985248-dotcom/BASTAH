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
  STORE_SUSPENDED: PauseCircle,
  STORE_REACTIVATED: PlayCircle,
  STORE_VERIFIED: CheckCircle2,
  STORE_REJECTED: XCircle,
  SUBSCRIPTION_CHANGED: Gem,
  INVOICE_MARKED_PAID: CreditCard,
  REFUND_ISSUED: Undo2,
  USER_ROLE_CHANGED: User,
  PRODUCT_REMOVED: Trash2,
  PAYOUT_PROCESSED: Banknote,
};

export default function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<any>("/api/admin/audit-log?limit=50")
      .then((d) => setLogs(d.logs))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.colors.text.mid,
          fontSize: t.typography.fontSize.xs,
        }}
      >
        جاري تحميل سجل العمليات...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        style={{
          minHeight: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "16px",
          borderRadius: t.radius.md,
          background: t.colors.cream.bg,
          border: `1px solid ${t.colors.cream.border}`,
          color: t.colors.semantic.danger,
          fontSize: t.typography.fontSize.xs,
        }}
      >
        <AlertTriangle size={16} strokeWidth={1.8} />
        <span>تعذّر تحميل سجل العمليات</span>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: t.spacing["2"],
      }}
    >
      {logs.length === 0 && (
        <div
          style={{
            minHeight: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          لا توجد سجلات بعد
        </div>
      )}

      {logs.map((l) => {
        const Icon = ACTION_ICONS[l.action] ?? FileEdit;

        return (
          <div
            key={l.id}
            style={{
              position: "relative",
              background: t.colors.white,
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: t.radius.md,
              padding: "12px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              transition:
                "border-color 150ms ease, box-shadow 150ms ease",
            }}
          >
            {/* أيقونة العملية */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: t.colors.cream.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                size={17}
                strokeWidth={1.8}
                color={t.colors.primary[800]}
              />
            </div>

            {/* بيانات العملية */}
            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <p
                style={{
                  margin: "1px 0 5px",
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.text.dark,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {l.action.replace(/_/g, " ")}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: t.colors.text.mid,
                  lineHeight: 1.7,
                  wordBreak: "break-word",
                }}
              >
                {l.actor?.name} · {l.targetType}{" "}
                {l.targetId.slice(0, 8)}...
              </p>

              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 10,
                  color: t.colors.text.light,
                  lineHeight: 1.5,
                }}
              >
                {new Date(l.createdAt).toLocaleString("ar-SA")}
              </p>
            </div>
          </div>
        );
      })}

      <style>{`
        @media (hover: hover) {
          div[role="presentation"] {
            transition:
              border-color 150ms ease,
              box-shadow 150ms ease;
          }
        }
      `}</style>
    </div>
  );
}

