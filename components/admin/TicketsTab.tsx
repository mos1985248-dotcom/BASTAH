// components/admin/TicketsTab.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Headset, MessageSquare } from "lucide-react";
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
      await api.post(`/api/admin/tickets/${selected.id}`, {
        content: reply,
        isInternal,
      });

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
      await api.patch("/api/admin/tickets", {
        ticketId: selected.id,
        status,
      });

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
    <div dir="rtl" style={{ width: "100%" }}>
      {/* رسائل الأخطاء */}
      {(listError || actionError) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "11px 14px",
            marginBottom: t.spacing["3"],
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          <span
            style={{
              width: 29,
              height: 29,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: t.colors.semantic.dangerBg,
            }}
          >
            <AlertTriangle size={14} strokeWidth={1.8} />
          </span>

          <span>
            {listError
              ? "تعذّر تحميل التذاكر"
              : actionError}
          </span>
        </div>
      )}

      {/* عنوان القسم */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: t.spacing["3"],
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.sm,
            background: t.colors.primary[50],
            color: t.colors.primary[800],
          }}
        >
          <Headset size={17} strokeWidth={1.8} />
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
            }}
          >
            مركز الدعم
          </h3>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: 10,
              color: t.colors.text.mid,
            }}
          >
            متابعة تذاكر الدعم والرد على المستخدمين
          </p>
        </div>
      </div>

      {/* منطقة التذاكر */}
      <div
        className="basita-admin-tickets-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(230px, 1fr) minmax(0, 1.5fr)",
          gap: t.spacing["3"],
          minHeight: 400,
          alignItems: "stretch",
        }}
      >
        {/* قائمة التذاكر */}
        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: t.colors.text.dark,
              }}
            >
              التذاكر
            </p>

            {!loading && (
              <span
                style={{
                  minWidth: 24,
                  height: 22,
                  padding: "0 7px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.full,
                  background: t.colors.cream.bg,
                  color: t.colors.text.mid,
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                {tickets.length}
              </span>
            )}
          </div>

          <TicketListPane
            tickets={tickets}
            loading={loading}
            selectedId={selected?.id ?? null}
            onSelect={loadDetail}
          />
        </div>

        {/* تفاصيل التذكرة */}
        <div
          style={{
            minWidth: 0,
            minHeight: 400,
          }}
        >
          {selected ? (
            <TicketDetailPane
              ticket={selected}
              reply={reply}
              onReplyChange={setReply}
              sending={sending}
              onSendReply={sendReply}
              onUpdateStatus={updateStatus}
            />
          ) : (
            <div
              style={{
                height: "100%",
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 25,
                boxSizing: "border-box",
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.lg,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: t.colors.cream.bg,
                  color: t.colors.primary[800],
                }}
              >
                <MessageSquare size={21} strokeWidth={1.6} />
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: 600,
                  color: t.colors.text.dark,
                }}
              >
                اختر تذكرة
              </p>

              <p
                style={{
                  maxWidth: 260,
                  margin: 0,
                  fontSize: 10,
                  lineHeight: 1.7,
                  color: t.colors.text.mid,
                }}
              >
                اختر إحدى تذاكر الدعم من القائمة لعرض المحادثة والرد على المستخدم.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .basita-admin-tickets-grid {
            grid-template-columns: 1fr !important;
          }

          .basita-admin-tickets-grid > div:last-child {
            min-height: 360px !important;
          }
        }

        @media (max-width: 480px) {
          .basita-admin-tickets-grid {
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}