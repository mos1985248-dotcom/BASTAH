// app/dashboard/support/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import NewTicketForm from "@/components/dashboard/support/NewTicketForm";
import TicketList, { Ticket } from "@/components/dashboard/support/TicketList";
import TicketDetail, { TicketMessage } from "@/components/dashboard/support/TicketDetail";

import { uiVars } from "@/components/ui/vars";
import f from "@/components/dashboard/forms.module.css";
import c from "@/components/dashboard/support/support.module.css";
export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<{ ticket: Ticket; messages: TicketMessage[] } | null>(null);
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ subject: "", category: "technical", message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const d = await api.get<{ tickets: Ticket[] }>("/api/support/tickets");
      setTickets(d.tickets);
    } catch {
      // تجاهل — سيبقى view=list فارغاً مع رسالة "لا توجد تذاكر"
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (ticket: Ticket) => {
    // ملاحظة: المشتري يستخدم نفس endpoint تفاصيل تذكرة الأدمن (يرجّع فقط الرسائل المسموح له رؤيتها)
    const d = await api.get<{ ticket: any }>(`/api/admin/tickets/${ticket.id}`).catch(() => null);
    if (d) setSelected({ ticket: d.ticket, messages: d.ticket.messages.filter((m: TicketMessage) => !m.isInternal) });
    setView("detail");
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setError("الموضوع والرسالة مطلوبان");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/support/tickets", form);
      await loadTickets();
      setForm({ subject: "", category: "technical", message: "" });
      setView("list");
    } catch (e: any) {
      setError(e.message ?? "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSubmitting(true);
    try {
      await api.post(`/api/support/tickets/${selected.ticket.id}/messages`, { content: reply });
      setReply("");
      await loadDetail(selected.ticket);
    } catch (e: any) {
      setError(e.message ?? "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={f.page} style={uiVars}>
      <div className={c.wrap}>
        <div className={c.head}>
          <h1 className={c.title}>الدعم والمساعدة</h1>
          <div className={c.headBtns}>
            {view !== "new" && (
              <button type="button" onClick={() => { setView("new"); setError(""); }} className={f.cta}>
                <Plus size={15} strokeWidth={2} />
                طلب دعم جديد
              </button>
            )}
            {view !== "list" && (
              <button type="button" onClick={() => setView("list")} className={`${f.cta} ${f.ghost}`}>
                <ArrowRight size={15} strokeWidth={1.8} />
                رجوع للقائمة
              </button>
            )}
          </div>
        </div>

        {view === "new" && (
          <NewTicketForm
            form={form}
            onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
            error={error}
            submitting={submitting}
            onSubmit={handleCreate}
          />
        )}

        {view === "list" && <TicketList tickets={tickets} loading={loading} onSelect={loadDetail} />}

        {view === "detail" && selected && (
          <TicketDetail
            ticket={selected.ticket}
            messages={selected.messages}
            reply={reply}
            onReplyChange={setReply}
            onSendReply={handleReply}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
