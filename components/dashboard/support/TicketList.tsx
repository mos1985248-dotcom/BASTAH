// components/dashboard/support/TicketList.tsx
import { Ticket as TicketIcon, ThumbsUp } from "lucide-react";
import { t } from "@/theme";
import TicketStatusBadge from "./TicketStatusBadge";

export interface Ticket {
  id: string; ticketNumber: string; subject: string; category: string;
  status: string; createdAt: string; _count: { messages: number };
}

export default function TicketList({ tickets, loading, onSelect }: { tickets: Ticket[]; loading: boolean; onSelect: (t: Ticket) => void }) {
  if (loading) return <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.sm }}>جاري التحميل...</p>;

  if (tickets.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: `${t.spacing["10"]} ${t.spacing["5"]}`, background: t.colors.white, borderRadius: t.radius.xl }}>
        <TicketIcon size={38} strokeWidth={1.5} color={t.colors.text.light} style={{ margin: "0 auto" }} />
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: t.colors.text.mid, fontSize: t.typography.fontSize.sm, marginTop: t.spacing["2"] }}>
          لا توجد تذاكر دعم — كل شيء بخير!
          <ThumbsUp size={15} strokeWidth={1.8} />
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
      {tickets.map((tk) => (
        <div
          key={tk.id}
          onClick={() => onSelect(tk)}
          style={{
            background: t.colors.white,
            borderRadius: t.radius.lg,
            padding: "14px 16px",
            border: `1px solid ${t.colors.cream.border}`,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: "0 0 3px", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{tk.subject}</p>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
              {tk.ticketNumber} · {tk._count.messages} رسائل · {new Date(tk.createdAt).toLocaleDateString("ar")}
            </p>
          </div>
          <TicketStatusBadge status={tk.status} />
        </div>
      ))}
    </div>
  );
}
