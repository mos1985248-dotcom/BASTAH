// components/admin/StoreRow.tsx
import { BadgeCheck, CheckCircle2, XCircle, PauseCircle, PlayCircle } from "lucide-react";
import { t } from "@/theme";

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  ACTIVE: { color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  SUSPENDED: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  PENDING: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  CLOSED: { color: t.colors.text.light, bg: t.colors.cream.bg },
};

const actionBtn = (color: string, bg: string): React.CSSProperties => ({
  padding: "4px 10px", background: bg, color, border: "none", borderRadius: t.radius.sm, fontSize: 10, cursor: "pointer",
});

export default function StoreRow({ store, busy, onAction }: { store: any; busy: boolean; onAction: (endpoint: string, body: object) => void }) {
  const badge = STATUS_BADGE[store.status] ?? STATUS_BADGE.CLOSED;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "12px 14px", border: `1px solid ${t.colors.cream.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: t.spacing["2"], marginBottom: t.spacing["2"] }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            {store.nameAr} {store.isVerified && <BadgeCheck size={13} strokeWidth={1.8} color={t.colors.primary[800]} style={{ display: "inline", verticalAlign: "-2px" }} />}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>
            {store.user?.email} · {store.subscription?.plan ?? "-"} · {store._count?.products ?? 0} منتج
          </p>
        </div>
        <span style={{ padding: "3px 10px", borderRadius: t.radius.sm, background: badge.bg, color: badge.color, fontSize: 10, fontWeight: t.typography.fontWeight.bold }}>
          {store.status}
        </span>
      </div>

      <div style={{ display: "flex", gap: t.spacing["1"], flexWrap: "wrap" }}>
        {store.verificationStatus === "PENDING_REVIEW" && (
          <>
            <button onClick={() => onAction(`/api/admin/stores/${store.id}/verify`, { action: "approve" })} disabled={busy} style={{ ...actionBtn(t.colors.semantic.success, t.colors.semantic.successBg), display: "inline-flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={12} strokeWidth={2} />
              قبول
            </button>
            <button
              onClick={() => { const r = prompt("سبب الرفض؟"); if (r) onAction(`/api/admin/stores/${store.id}/verify`, { action: "reject", reason: r }); }}
              disabled={busy}
              style={{ ...actionBtn(t.colors.semantic.danger, t.colors.semantic.dangerBg), display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <XCircle size={12} strokeWidth={2} />
              رفض
            </button>
          </>
        )}
        {store.status === "ACTIVE" && (
          <button
            onClick={() => { const r = prompt("سبب التعليق؟"); if (r) onAction(`/api/admin/stores/${store.id}/suspend`, { action: "suspend", reason: r }); }}
            disabled={busy}
            style={{ ...actionBtn(t.colors.semantic.warning, t.colors.semantic.warningBg), display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <PauseCircle size={12} strokeWidth={2} />
            تعليق
          </button>
        )}
        {store.status === "SUSPENDED" && (
          <button onClick={() => onAction(`/api/admin/stores/${store.id}/suspend`, { action: "reactivate" })} disabled={busy} style={{ ...actionBtn(t.colors.semantic.success, t.colors.semantic.successBg), display: "inline-flex", alignItems: "center", gap: 4 }}>
            <PlayCircle size={12} strokeWidth={2} />
            تفعيل
          </button>
        )}
      </div>
    </div>
  );
}
