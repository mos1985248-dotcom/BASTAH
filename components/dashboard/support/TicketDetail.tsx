// components/dashboard/support/TicketDetail.tsx
import { Ticket as TicketIcon, AlertTriangle, ArrowLeft } from "lucide-react";
import { t } from "@/theme";
import TicketStatusBadge from "./TicketStatusBadge";
import { Ticket } from "./TicketList";

export interface TicketMessage {
  id: string; content: string; isInternal: boolean; createdAt: string;
  user: { name: string; role: string };
}

export default function TicketDetail({
  ticket,
  messages,
  reply,
  onReplyChange,
  onSendReply,
  submitting,
  error,
}: {
  ticket: Ticket;
  messages: TicketMessage[];
  reply: string;
  onReplyChange: (v: string) => void;
  onSendReply: () => void;
  submitting: boolean;
  error: string;
}) {
  return (
    <div>
      <div style={{ background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["4"], marginBottom: t.spacing["3"], display: "flex", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{ticket.subject}</p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>{ticket.ticketNumber}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"], marginBottom: t.spacing["3"] }}>
        {messages.map((m) => {
          const isSupport = m.user.role === "ADMIN" || m.user.role === "SUPER_ADMIN";
          return (
            <div
              key={m.id}
              style={{
                background: isSupport ? t.colors.primary[50] : t.colors.white,
                borderRadius: t.radius.lg,
                padding: "10px 14px",
                border: `1px solid ${t.colors.cream.border}`,
                alignSelf: isSupport ? "flex-start" : "flex-end",
                maxWidth: "85%",
              }}
            >
              <p style={{ display: "flex", alignItems: "center", gap: 4, margin: "0 0 3px", fontSize: 10, color: isSupport ? t.colors.primary[800] : t.colors.text.mid, fontWeight: t.typography.fontWeight.bold }}>
                {isSupport ? (
                  <>
                    <TicketIcon size={11} strokeWidth={1.8} />
                    فريق الدعم
                  </>
                ) : (
                  "أنتِ"
                )}
                · {new Date(m.createdAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.dark, lineHeight: t.typography.lineHeight.relaxed }}>{m.content}</p>
            </div>
          );
        })}
      </div>

      {ticket.status !== "CLOSED" ? (
        <div style={{ background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["4"] }}>
          <textarea
            value={reply}
            onChange={(e) => onReplyChange(e.target.value)}
            rows={4}
            placeholder="اكتبي ردك أو أي معلومات إضافية..."
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, direction: "rtl", resize: "none", boxSizing: "border-box", marginBottom: t.spacing["2"] }}
          />
          {error && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger }}>
              <AlertTriangle size={13} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button
            onClick={onSendReply}
            disabled={submitting || !reply.trim()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: 11, background: submitting ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.text.onDark, border: "none", borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            {submitting ? (
              "جاري الإرسال..."
            ) : (
              <>
                إرسال
                <ArrowLeft size={14} strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      ) : (
        <p style={{ textAlign: "center", color: t.colors.text.light, fontSize: t.typography.fontSize.sm }}>هذه التذكرة مغلقة ولا يمكن الرد عليها</p>
      )}
    </div>
  );
}
