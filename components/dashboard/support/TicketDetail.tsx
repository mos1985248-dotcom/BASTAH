// components/dashboard/support/TicketDetail.tsx
import { Ticket as TicketIcon, AlertTriangle, ArrowLeft } from "lucide-react";
import TicketStatusBadge from "./TicketStatusBadge";
import { Ticket } from "./TicketList";
import f from "../forms.module.css";
import s from "./support.module.css";

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
      <div className={s.ticketHead}>
        <div>
          <p className={s.subject}>{ticket.subject}</p>
          <p className={s.meta}>{ticket.ticketNumber}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className={s.thread}>
        {messages.map((m) => {
          const isSupport = m.user.role === "ADMIN" || m.user.role === "SUPER_ADMIN";
          return (
            <div key={m.id} className={`${s.msg} ${isSupport ? s.msgSupport : s.msgMine}`}>
              <p className={s.who}>
                {isSupport ? (
                  <>
                    <TicketIcon size={12} strokeWidth={1.8} />
                    فريق الدعم
                  </>
                ) : (
                  "أنت"
                )}
                · {new Date(m.createdAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className={s.body}>{m.content}</p>
            </div>
          );
        })}
      </div>

      {ticket.status !== "CLOSED" ? (
        <div className={`${f.panel} ${s.reply}`}>
          <textarea
            value={reply}
            onChange={(e) => onReplyChange(e.target.value)}
            rows={4}
            placeholder="اكتب ردك أو أي معلومات إضافية..."
            aria-label="ردك"
            className={`${f.field} ${f.area} ${s.noResize}`}
          />
          {error && (
            <p className={f.err} role="alert">
              <AlertTriangle size={15} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button type="button" onClick={onSendReply} disabled={submitting || !reply.trim()} className={`${f.cta} ${s.submit}`}>
            {submitting ? (
              "جاري الإرسال..."
            ) : (
              <>
                إرسال
                <ArrowLeft size={15} strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      ) : (
        <p className={s.closed}>هذه التذكرة مغلقة ولا يمكن الرد عليها</p>
      )}
    </div>
  );
}
