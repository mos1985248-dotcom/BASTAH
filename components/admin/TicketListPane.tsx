// components/admin/TicketListPane.tsx
import { MessageSquare } from "lucide-react";
import { t } from "@/theme";
import {
  TICKET_STATUS_COLOR,
  TICKET_STATUS_LABEL,
} from "@/lib/ticket-status";

export default function TicketListPane({
  tickets,
  loading,
  selectedId,
  onSelect,
}: {
  tickets: any[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
          color: t.colors.text.mid,
          fontSize: t.typography.fontSize.xs,
        }}
      >
        جاري تحميل التذاكر...
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: 150,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 20,
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: t.colors.cream.bg,
            color: t.colors.primary[800],
          }}
        >
          <MessageSquare size={19} strokeWidth={1.7} />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: t.typography.fontSize.xs,
            fontWeight: 600,
            color: t.colors.text.dark,
          }}
        >
          لا توجد تذاكر
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 10,
            color: t.colors.text.mid,
          }}
        >
          لا توجد طلبات دعم متاحة حاليًا
        </p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      {tickets.map((tk) => {
        const s =
          TICKET_STATUS_COLOR[tk.status] ??
          TICKET_STATUS_COLOR.CLOSED;

        const active = selectedId === tk.id;

        return (
          <div
            key={tk.id}
            className={`basita-ticket-list-item ${
              active ? "is-active" : ""
            }`}
            onClick={() => onSelect(tk.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelect(tk.id);
              }
            }}
            style={{
              position: "relative",
              overflow: "hidden",
              background: active
                ? t.colors.primary[50]
                : t.colors.white,
              borderRadius: t.radius.md,
              padding: "12px 13px",
              border: `1px solid ${
                active
                  ? t.colors.primary[800]
                  : t.colors.cream.border
              }`,
              cursor: "pointer",
              transition:
                "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background 150ms ease",
              boxShadow: active
                ? "0 3px 12px rgba(0,0,0,0.045)"
                : "none",
            }}
          >
            {/* مؤشر التذكرة المحددة */}
            {active && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: 3,
                  background: t.colors.primary[800],
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 7,
              }}
            >
              <p
                style={{
                  flex: 1,
                  minWidth: 0,
                  margin: 0,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.text.dark,
                  lineHeight: 1.6,
                  overflowWrap: "anywhere",
                }}
              >
                {tk.subject}
              </p>

              <span
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 22,
                  padding: "0 8px",
                  borderRadius: t.radius.full,
                  background: s.bg,
                  color: s.color,
                  fontSize: 9,
                  fontWeight: t.typography.fontWeight.bold,
                  whiteSpace: "nowrap",
                }}
              >
                {TICKET_STATUS_LABEL[tk.status]}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <p
                style={{
                  minWidth: 0,
                  margin: 0,
                  fontSize: 10,
                  color: t.colors.text.mid,
                  lineHeight: 1.6,
                  overflowWrap: "anywhere",
                }}
              >
                {tk.user?.name}
              </p>

              <span
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 9,
                  color: t.colors.text.light,
                  whiteSpace: "nowrap",
                }}
              >
                <MessageSquare size={11} strokeWidth={1.7} />
                {tk._count?.messages ?? 0} رسائل
              </span>
            </div>
          </div>
        );
      })}

      <style>{`
        .basita-ticket-list-item:not(.is-active):hover {
          transform: translateY(-1px);
          border-color: ${t.colors.primary[100]};
          box-shadow: 0 4px 13px rgba(0, 0, 0, 0.045);
        }

        .basita-ticket-list-item:focus-visible {
          outline: 2px solid ${t.colors.primary[800]};
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .basita-ticket-list-item {
            padding: 11px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}