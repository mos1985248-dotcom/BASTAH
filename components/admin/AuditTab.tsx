// components/admin/AuditTab.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import AuditRow, { type AuditLogRow } from "./AuditRow";

export default function AuditTab() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
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

      {logs.map((l) => (
        <AuditRow key={l.id} log={l} />
      ))}
    </div>
  );
}

