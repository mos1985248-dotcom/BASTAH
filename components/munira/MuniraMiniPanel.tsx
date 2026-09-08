// components/munira/MuniraMiniPanel.tsx
// نسخة مصغّرة قابلة للطي من واجهة منيرة — للعميل/الزائر داخل سياق متجر
// أو منتج (وليست منيرة التاجر بلوحة التاجر). تُبنى فوق useMuniraChat نفسه
// (نفس الـ endpoint والـ rate limiting)، فقط واجهة أخف من ChatWindow
// الكاملة المستخدمة بصفحة /dashboard/munira.
"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";
import { useMuniraChat } from "@/hooks/useMuniraChat";
import { MessageBubble } from "@/components/munira/MessageBubble";
import { ChatInput } from "@/components/munira/ChatInput";

interface Props {
  title: string;
  subtitle: string;
  suggestions: string[];
  defaultOpen?: boolean;
}

export default function MuniraMiniPanel({ title, subtitle, suggestions, defaultOpen = false }: Props) {
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(defaultOpen);

  const role = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? "admin" : user ? "buyer" : "guest";

  const {
    messages, streaming, recording, error,
    send, retry, clear, cancel,
    startRecording, stopRecording,
  } = useMuniraChat({ userType: role });

  return (
    <div
      style={{
        background: t.colors.white,
        border: `1.5px solid ${t.colors.primary[100]}`,
        borderRadius: t.radius.lg,
        overflow: "hidden",
        boxShadow: t.shadows.sm,
        direction: "rtl",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="basita-btn-interactive"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: t.spacing["3"],
          padding: t.spacing["4"],
          background: "none",
          border: "none",
          textAlign: "start",
          cursor: "pointer",
        }}
      >
        <div style={{ position: "relative", width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: `1.5px solid ${t.colors.gold[400]}`, flexShrink: 0 }}>
          <Image src="/images/munira-avatar.png" alt="منيرة" fill style={{ objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
            {title}
          </p>
          <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.snug }}>{subtitle}</p>
        </div>
        <span style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${t.colors.cream.border}` }}>
          <div style={{ maxHeight: 420, overflowY: "auto", padding: `${t.spacing["4"]} ${t.spacing["4"]} 0`, background: t.colors.cream?.warm || "#fdfbf7" }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: t.spacing["2"], padding: `0 0 ${t.spacing["4"]}` }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="basita-btn-interactive"
                    style={{
                      padding: "8px 14px",
                      background: t.colors.white,
                      border: `1px solid ${t.colors.cream.border}`,
                      borderRadius: t.radius.full,
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.primary[800],
                      cursor: "pointer",
                      boxShadow: t.shadows.sm,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {error && (
              <div style={{ background: t.colors.semantic.dangerBg, borderRadius: t.radius.md, padding: "12px 16px", margin: "8px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${t.colors.semantic.danger}` }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.medium }}>
                  <AlertTriangle size={15} strokeWidth={1.8} />
                  {error}
                </span>
                <button
                  onClick={retry}
                  className="basita-btn-interactive"
                  style={{ padding: "6px 12px", background: t.colors.semantic.danger, color: t.colors.white, border: "none", borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: "pointer" }}
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {messages.length > 0 && (
              <div style={{ textAlign: "center", paddingBottom: t.spacing["3"] }}>
                <button
                  onClick={clear}
                  className="basita-btn-interactive"
                  style={{
                    background: t.colors.cream?.bg || "#f9f6f0",
                    border: `1px solid ${t.colors.cream.border}`,
                    borderRadius: t.radius.full,
                    padding: "6px 14px",
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.primary[800],
                    cursor: "pointer",
                  }}
                >
                  محادثة جديدة
                </button>
              </div>
            )}
          </div>

          <ChatInput
            onSend={send}
            onCancel={() => (streaming ? cancel() : stopRecording())}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            streaming={streaming}
            recording={recording}
          />
        </div>
      )}
    </div>
  );
}