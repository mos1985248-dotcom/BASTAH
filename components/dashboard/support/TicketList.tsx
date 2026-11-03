// components/dashboard/support/TicketList.tsx
import { Ticket as TicketIcon, ThumbsUp } from "lucide-react";
import TicketStatusBadge from "./TicketStatusBadge";
import s from "./support.module.css";

export interface Ticket {
  id: string; ticketNumber: string; subject: string; category: string;
  status: string; createdAt: string; _count: { messages: number };
}

export default function TicketList({ tickets, loading, onSelect }: { tickets: Ticket[]; loading: boolean; onSelect: (t: Ticket) => void }) {
  if (loading) return <p className={s.loading} role="status">جاري التحميل...</p>;

  if (tickets.length === 0) {
    return (
      <div className={s.state}>
        <TicketIcon size={38} strokeWidth={1.5} aria-hidden="true" />
        <p className={s.stateLine}>
          لا توجد تذاكر دعم — كل شيء بخير!
          <ThumbsUp size={15} strokeWidth={1.8} aria-hidden="true" />
        </p>
      </div>
    );
  }

  return (
    <ul className={s.list}>
      {tickets.map((tk) => (
        <li key={tk.id}>
          <button type="button" onClick={() => onSelect(tk)} className={s.row}>
            <span className={s.rowBody}>
              <p className={s.subject}>{tk.subject}</p>
              <p className={s.meta}>
                {tk.ticketNumber} · {tk._count.messages} رسائل · {new Date(tk.createdAt).toLocaleDateString("ar")}
              </p>
            </span>
            <TicketStatusBadge status={tk.status} />
          </button>
        </li>
      ))}
    </ul>
  );
}
