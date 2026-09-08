// components/admin/TicketsTab.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import TicketListPane from "./TicketListPane";
import TicketDetailPane from "./TicketDetailPane";

export default function TicketsTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.get<any>("/api/admin/tickets?limit=40");
      setTickets(d.tickets);
    } catch {
      setListError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setActionError("");
    try {
      const d = await api.get<any>(`/api/admin/tickets/${id}`);
      setSelected(d.ticket);
    } catch {
      setActionError("تعذّر تحميل تفاصيل التذكرة");
    }
  };

  const sendReply = async (isInternal: boolean) => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    setActionError("");
    try {
      await api.post(`/api/admin/tickets/${selected.id}`, { content: reply, isInternal });
      setReply("");
      await loadDetail(selected.id);
      load();
    } catch {
      setActionError("تعذّر إرسال الرد");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setActionError("");
    try {
      await api.patch("/api/admin/tickets", { ticketId: selected.id, status });
      await loadDetail(selected.id);
      load();
    } catch {
      setActionError("تعذّر تحديث الحالة");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      {listError && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs, marginBottom: t.spacing["2"] }}>
          <AlertTriangle size={14} strokeWidth={1.8} />
          تعذّر تحميل التذاكر
        </p>
      )}
      {actionError && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs, marginBottom: t.spacing["2"] }}>
          <AlertTriangle size={14} strokeWidth={1.8} />
          {actionError}
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: t.spacing["3"], minHeight: 400 }} className="basita-admin-tickets-grid">
        <TicketListPane tickets={tickets} loading={loading} selectedId={selected?.id ?? null} onSelect={loadDetail} />

        {selected ? (
          <TicketDetailPane ticket={selected} reply={reply} onReplyChange={setReply} sending={sending} onSendReply={sendReply} onUpdateStatus={updateStatus} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: t.colors.text.light, fontSize: t.typography.fontSize.sm }}>
            اختر تذكرة لعرض تفاصيلها
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .basita-admin-tickets-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
