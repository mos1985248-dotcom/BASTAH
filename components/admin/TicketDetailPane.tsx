// components/admin/TicketDetailPane.tsx
import { Check } from "lucide-react";
import { t } from "@/theme";

export default function TicketDetailPane({
  ticket,
  reply,
  onReplyChange,
  sending,
  onSendReply,
  onUpdateStatus,
}: {
  ticket: any;
  reply: string;
  onReplyChange: (v: string) => void;
  sending: boolean;
  onSendReply: (isInternal: boolean) => void;
  onUpdateStatus: (status: string) => void;
}) {
  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"], border: `1px solid ${t.colors.cream.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: t.spacing["3"] }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{ticket.subject}</p>
          <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>{ticket.user?.name} · {ticket.user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {ticket.status !== "RESOLVED" && (
            <button onClick={() => onUpdateStatus("RESOLVED")} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: t.colors.semantic.successBg, color: t.colors.semantic.success, border: "none", borderRadius: t.radius.sm, fontSize: 10, cursor: "pointer" }}>
              <Check size={11} strokeWidth={2.2} />
              محلول
            </button>
          )}
          {ticket.status !== "CLOSED" && (
            <button onClick={() => onUpdateStatus("CLOSED")} style={{ padding: "4px 10px", background: t.colors.cream.bg, color: t.colors.text.light, border: "none", borderRadius: t.radius.sm, fontSize: 10, cursor: "pointer" }}>
              إغلاق
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 300, display: "flex", flexDirection: "column", gap: t.spacing["2"], marginBottom: t.spacing["3"] }}>
        {(ticket.messages ?? []).map((m: any) => (
          <div
            key={m.id}
            style={{
              padding: "8px 12px", borderRadius: t.radius.md,
              background: m.isInternal ? t.colors.semantic.warningBg : (m.user?.role === "BUYER" || m.user?.role === "SELLER") ? t.colors.primary[50] : t.colors.cream.bg,
              border: m.isInternal ? `1px solid ${t.colors.semantic.warning}` : "none",
              direction: "rtl",
            }}
          >
            <p style={{ margin: "0 0 3px", fontSize: 10, color: t.colors.text.mid }}>
              {m.user?.name} {m.isInternal && <span style={{ color: t.colors.semantic.warning }}>(ملاحظة داخلية)</span>}
            </p>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.dark }}>{m.content}</p>
          </div>
        ))}
      </div>

      <textarea
        value={reply}
        onChange={(e) => onReplyChange(e.target.value)}
        rows={3}
        placeholder="اكتب ردك..."
        style={{ padding: "8px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.xs, direction: "rtl", resize: "none", marginBottom: t.spacing["2"] }}
      />
      <div style={{ display: "flex", gap: t.spacing["1"] }}>
        <button onClick={() => onSendReply(false)} disabled={sending || !reply.trim()} style={{ flex: 2, padding: 8, background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, cursor: "pointer", fontSize: t.typography.fontSize.xs }}>
          إرسال للمستخدم
        </button>
        <button onClick={() => onSendReply(true)} disabled={sending || !reply.trim()} style={{ flex: 1, padding: 8, background: t.colors.semantic.warningBg, color: t.colors.semantic.warning, border: "none", borderRadius: t.radius.md, cursor: "pointer", fontSize: t.typography.fontSize.xs }}>
          ملاحظة داخلية
        </button>
      </div>
    </div>
  );
}
