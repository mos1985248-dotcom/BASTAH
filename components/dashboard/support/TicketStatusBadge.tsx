// components/dashboard/support/TicketStatusBadge.tsx
import { t } from "@/theme";
import { TICKET_STATUS_COLOR as STATUS_STYLE, TICKET_STATUS_LABEL as STATUS_LABEL } from "@/lib/ticket-status";

export { STATUS_STYLE, STATUS_LABEL };

export default function TicketStatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.CLOSED;
  return (
    <span style={{ padding: "3px 10px", borderRadius: t.radius.full, background: s.bg, color: s.color, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
