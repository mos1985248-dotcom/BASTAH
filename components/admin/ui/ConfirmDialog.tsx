// components/admin/ui/ConfirmDialog.tsx
// يستبدل window.prompt()/confirm() المستخدمة سابقاً بـStoresTab/BlogTab —
// نفس السلوك المنطقي (تأكيد + سبب اختياري) بواجهة متّسقة مع الهوية.
"use client";

import { useState } from "react";
import { t } from "@/theme";

interface Props {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
  requireReason?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, body, confirmLabel = "تأكيد", danger, requireReason, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState("");
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(15,61,46,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: t.spacing["4"] }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["5"], maxWidth: 380, width: "100%" }}>
        <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{title}</h3>
        {body && <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>{body}</p>}

        {requireReason && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="السبب..."
            rows={2}
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, direction: "rtl", resize: "none", marginBottom: t.spacing["3"], boxSizing: "border-box" }}
          />
        )}

        <div style={{ display: "flex", gap: t.spacing["2"] }}>
          <button
            onClick={() => onConfirm(requireReason ? reason : undefined)}
            disabled={requireReason && !reason.trim()}
            style={{
              flex: 1, padding: 11, borderRadius: t.radius.md, border: "none", cursor: "pointer",
              fontWeight: t.typography.fontWeight.bold, fontSize: t.typography.fontSize.sm,
              background: danger ? t.colors.semantic.danger : t.colors.primary[800],
              color: t.colors.white,
              opacity: requireReason && !reason.trim() ? 0.5 : 1,
            }}
          >
            {confirmLabel}
          </button>
          <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.text.mid, cursor: "pointer", fontSize: t.typography.fontSize.sm }}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
