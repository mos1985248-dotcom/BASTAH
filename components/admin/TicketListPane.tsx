// components/admin/TicketListPane.tsx
import { t } from "@/theme";
import { TICKET_STATUS_COLOR, TICKET_STATUS_LABEL } from "@/lib/ticket-status";

export default function TicketListPane({ tickets, loading, selectedId, onSelect }: { tickets: any[]; loading: boolean; selectedId: string | null; onSelect: (id: string) => void }) {
  if (loading) return <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>جاري التحميل...</p>;

  return (
    <div>
      {tickets.map((tk) => {
        const s = TICKET_STATUS_COLOR[tk.status] ?? TICKET_STATUS_COLOR.CLOSED;
        const active = selectedId === tk.id;
        return (
          <div
            key={tk.id}
            onClick={() => onSelect(tk.id)}
            style={{
              background: active ? t.colors.primary[50] : t.colors.white,
              borderRadius: t.radius.md, padding: "10px 12px", marginBottom: t.spacing["1"],
              border: `1px solid ${active ? t.colors.primary[800] : t.colors.cream.border}`,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{tk.subject}</p>
              <span style={{ padding: "2px 8px", borderRadius: t.radius.sm, background: s.bg, color: s.color, fontSize: 10, fontWeight: t.typography.fontWeight.bold }}>{TICKET_STATUS_LABEL[tk.status]}</span>
            </div>
            <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>{tk.user?.name} · {tk._count?.messages ?? 0} رسائل</p>
          </div>
        );
      })}
    </div>
  );
}
