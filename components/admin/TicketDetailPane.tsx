// components/admin/TicketDetailPane.tsx
import { Check, MessageSquare, Send } from "lucide-react";
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
    <div
      className="basita-ticket-detail"
      dir="rtl"
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        border: `1px solid ${t.colors.cream.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div
        className="basita-ticket-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: t.spacing["3"],
          padding: "16px 18px",
          borderBottom: `1px solid ${t.colors.cream.border}`,
          background: t.colors.white,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 5,
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: t.colors.primary[50],
                color: t.colors.primary[800],
              }}
            >
              <MessageSquare size={15} strokeWidth={1.8} />
            </span>

            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
                lineHeight: 1.5,
                overflowWrap: "anywhere",
              }}
            >
              {ticket.subject}
            </p>
          </div>

          <p
            style={{
              margin: "0 0 0 37px",
              fontSize: 10,
              color: t.colors.text.mid,
              lineHeight: 1.6,
              overflowWrap: "anywhere",
            }}
          >
            {ticket.user?.name} · {ticket.user?.email}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {ticket.status !== "RESOLVED" && (
            <button
              type="button"
              onClick={() => onUpdateStatus("RESOLVED")}
              aria-label="تحديد التذكرة كمحلولة"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                minHeight: 30,
                padding: "0 10px",
                background: t.colors.semantic.successBg,
                color: t.colors.semantic.success,
                border: "none",
                borderRadius: t.radius.sm,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Check size={12} strokeWidth={2.2} />
              محلول
            </button>
          )}

          {ticket.status !== "CLOSED" && (
            <button
              type="button"
              onClick={() => onUpdateStatus("CLOSED")}
              aria-label="إغلاق التذكرة"
              style={{
                minHeight: 30,
                padding: "0 10px",
                background: t.colors.cream.bg,
                color: t.colors.text.light,
                border: "none",
                borderRadius: t.radius.sm,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              إغلاق
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="basita-ticket-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: 300,
          minHeight: 150,
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["2"],
          padding: "14px 18px",
          background: t.colors.cream.bg,
        }}
      >
        {(ticket.messages ?? []).length === 0 ? (
          <div
            style={{
              flex: 1,
              minHeight: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.xs,
            }}
          >
            لا توجد رسائل في هذه التذكرة
          </div>
        ) : (
          (ticket.messages ?? []).map((m: any) => (
            <div
              key={m.id}
              className="basita-ticket-message"
              style={{
                padding: "10px 12px",
                borderRadius: t.radius.md,
                background: m.isInternal
                  ? t.colors.semantic.warningBg
                  : m.user?.role === "BUYER" || m.user?.role === "SELLER"
                    ? t.colors.primary[50]
                    : t.colors.white,
                border: m.isInternal
                  ? `1px solid ${t.colors.semantic.warning}`
                  : `1px solid ${t.colors.cream.border}`,
                direction: "rtl",
                boxShadow: "0 1px 2px rgba(0,0,0,0.025)",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 10,
                  color: t.colors.text.mid,
                  lineHeight: 1.5,
                }}
              >
                {m.user?.name}{" "}
                {m.isInternal && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      marginRight: 4,
                      color: t.colors.semantic.warning,
                      fontWeight: 600,
                    }}
                  >
                    (ملاحظة داخلية)
                  </span>
                )}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.xs,
                  lineHeight: 1.8,
                  color: t.colors.text.dark,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {m.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Reply Area */}
      <div
        style={{
          padding: "14px 18px 16px",
          borderTop: `1px solid ${t.colors.cream.border}`,
          background: t.colors.white,
        }}
      >
        <textarea
          value={reply}
          onChange={(e) => onReplyChange(e.target.value)}
          rows={3}
          placeholder="اكتب ردك..."
          aria-label="نص الرد"
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            outline: "none",
            background: t.colors.cream.bg,
            color: t.colors.text.dark,
            fontSize: t.typography.fontSize.xs,
            lineHeight: 1.7,
            direction: "rtl",
            resize: "vertical",
            minHeight: 76,
            marginBottom: t.spacing["2"],
          }}
        />

        <div
          className="basita-ticket-actions"
          style={{
            display: "flex",
            gap: 7,
          }}
        >
          <button
            type="button"
            onClick={() => onSendReply(false)}
            disabled={sending || !reply.trim()}
            style={{
              flex: 2,
              minHeight: 38,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "0 12px",
              background: t.colors.primary[800],
              color: t.colors.white,
              border: "none",
              borderRadius: t.radius.md,
              cursor:
                sending || !reply.trim() ? "not-allowed" : "pointer",
              opacity: sending || !reply.trim() ? 0.55 : 1,
              fontSize: t.typography.fontSize.xs,
              fontWeight: 600,
              transition: "transform 150ms ease, opacity 150ms ease",
            }}
          >
            <Send size={13} strokeWidth={2} />
            إرسال للمستخدم
          </button>

          <button
            type="button"
            onClick={() => onSendReply(true)}
            disabled={sending || !reply.trim()}
            style={{
              flex: 1,
              minHeight: 38,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "0 10px",
              background: t.colors.semantic.warningBg,
              color: t.colors.semantic.warning,
              border: "none",
              borderRadius: t.radius.md,
              cursor:
                sending || !reply.trim() ? "not-allowed" : "pointer",
              opacity: sending || !reply.trim() ? 0.55 : 1,
              fontSize: t.typography.fontSize.xs,
              fontWeight: 600,
            }}
          >
            ملاحظة داخلية
          </button>
        </div>
      </div>

      <style>{`
        .basita-ticket-detail textarea:focus {
          border-color: ${t.colors.primary[800]};
          background: ${t.colors.white};
          box-shadow: 0 0 0 3px ${t.colors.primary[800]}12;
        }

        .basita-ticket-detail button:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .basita-ticket-messages::-webkit-scrollbar {
          width: 5px;
        }

        .basita-ticket-messages::-webkit-scrollbar-thumb {
          background: ${t.colors.cream.border};
          border-radius: 999px;
        }

        @media (max-width: 600px) {
          .basita-ticket-header {
            flex-direction: column !important;
          }

          .basita-ticket-header > div:last-child {
            width: 100%;
          }

          .basita-ticket-header > div:last-child button {
            flex: 1;
          }
        }

        @media (max-width: 420px) {
          .basita-ticket-actions {
            flex-direction: column;
          }

          .basita-ticket-actions button {
            flex: none !important;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}