// components/dashboard/ui/ConfirmDialog.tsx — نفس واجهة admin/ui/ConfirmDialog (تأكيد + سبب اختياري)
"use client";
import { useEffect, useState } from "react";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className={s.dlgScrim} style={uiVars} onClick={onCancel}>
      <div className={s.dlg} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h3 className={s.dlgTitle}>{title}</h3>
        {body && <p className={s.dlgBody}>{body}</p>}
        {requireReason && (
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="السبب..." rows={2} className={`${s.field} ${s.area}`} style={{ minHeight: 70, marginBottom: 14 }} />
        )}
        <div className={s.dlgActions}>
          <button type="button" className={`${s.btnSm} ${danger ? `${s.btnPrimary} ${s.btnDanger}` : s.btnPrimary}`} style={danger ? { background: "var(--ui-danger)", color: "var(--ui-white)" } : undefined} onClick={() => onConfirm(requireReason ? reason : undefined)} disabled={requireReason && !reason.trim()}>
            {confirmLabel}
          </button>
          <button type="button" className={s.btnSm} onClick={onCancel}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
