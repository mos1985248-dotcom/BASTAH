// components/munira/MessageBubble.tsx
"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { t } from "@/theme";
import { TypingIndicator } from "./TypingIndicator";
import type { Message } from "@/hooks/useMuniraChat";

import { ui } from "@/components/ui/css-vars";
interface Props {
  message: Message;
  lang?: "rtl" | "ltr"; // auto-detected from content if not set
}

function detectDir(text: string): "rtl" | "ltr" {
  const arabicCount = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) ?? []).length;
  return arabicCount >= latinCount ? "rtl" : "ltr";
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isEmpty = message.content === "" && message.pending;
  const dir = detectDir(message.content || "أ");

  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: t.spacing["3"], alignItems: "flex-end", marginBottom: t.spacing["5"], padding: "0 4px", direction: "rtl" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: t.radius.full,
          flexShrink: 0,
          background: isUser ? ui.border : ui.sand,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          userSelect: "none",
          overflow: "hidden",
          border: isUser ? "none" : `1px solid ${ui.gold}`,
        }}
      >
        {isUser ? (
          <User size={16} strokeWidth={1.8} color={ui.inkMuted} />
        ) : (
          <div style={{ position: "relative", width: 34, height: 34 }}>
            <Image src="/images/munira-avatar.png" alt="منيرة" fill style={{ objectFit: "cover" }} />
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: "78%",
          padding: isEmpty ? "8px 12px" : "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser ? ui.greenDeep : ui.card,
          border: isUser ? "none" : `1px solid ${message.error ? ui.danger : ui.border}`,
          color: isUser ? ui.card : message.error ? ui.danger : ui.ink,
          fontSize: t.typography.fontSize.sm,
          lineHeight: t.typography.lineHeight.relaxed,
          direction: dir,
          textAlign: dir === "rtl" ? "right" : "left",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: t.shadows.sm,
        }}
      >
        {isEmpty ? <TypingIndicator /> : message.content}
      </div>
    </div>
  );
}