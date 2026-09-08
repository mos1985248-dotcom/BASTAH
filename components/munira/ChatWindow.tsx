// components/munira/ChatWindow.tsx
"use client";

import Image from "next/image";
import { t } from "@/theme";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { Message } from "@/hooks/useMuniraChat";

interface Props {
  messages: Message[];
  streaming: boolean;
  recording: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onRetry: () => void;
  onClear: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancel: () => void;
  userName?: string;
}

export function ChatWindow({
  messages, streaming, recording, error,
  onSend, onRetry, onClear,
  onStartRecording, onStopRecording, onCancel,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", maxWidth: 380, marginLeft: "0", marginRight: "auto", background: t.colors.cream?.warm || "#fdfbf7", borderLeft: `1px solid ${t.colors.cream.border}`, direction: "rtl" }}>
      <div
        style={{
          background: t.colors.white,
          borderBottom: `1px solid ${t.colors.cream.border}`,
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: t.spacing["3"], alignItems: "center" }}>
          <div style={{ position: "relative", width: 42, height: 42, borderRadius: "50%", overflow: "hidden", border: `1.5px solid ${t.colors.gold[400]}` }}>
            <Image src="/images/munira-avatar.png" alt="منيرة" fill style={{ objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
              منيرة
            </p>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: streaming ? t.colors.gold[600] : t.colors.text.mid }}>
              {streaming ? "تكتب..." : "جاهزة للمساعدة"}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClear}
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
        )}
      </div>

      <MessageList messages={messages} streaming={streaming} error={error} onSuggestion={onSend} onRetry={onRetry} />

      <ChatInput
        onSend={onSend}
        onCancel={onCancel}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        streaming={streaming}
        recording={recording}
      />
    </div>
  );
}