// components/munira/ChatWindow.tsx
"use client";

import Image from "next/image";
import { t } from "@/theme";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { Message } from "@/hooks/useMuniraChat";

import { ui } from "@/components/ui/css-vars";
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", maxWidth: 920, marginLeft: "auto", marginRight: "auto", background: ui.sand, borderInline: `1px solid ${ui.border}`, direction: "rtl" }}>
      <div
        style={{
          background: ui.card,
          borderBottom: `1px solid ${ui.border}`,
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: t.spacing["3"], alignItems: "center" }}>
          <div style={{ position: "relative", width: 42, height: 42, borderRadius: "50%", overflow: "hidden", border: `1.5px solid ${ui.gold}` }}>
            <Image src="/images/munira-avatar.png" alt="منيرة" fill style={{ objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: ui.greenDeep }}>
              منيرة
            </p>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: streaming ? ui.gold : ui.inkMuted }}>
              {streaming ? "تكتب..." : "جاهزة للمساعدة"}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="basita-btn-interactive"
            style={{
              background: ui.sand,
              border: `1px solid ${ui.border}`,
              borderRadius: t.radius.full,
              padding: "6px 14px",
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium,
              color: ui.greenDeep,
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