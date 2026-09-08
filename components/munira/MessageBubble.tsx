// components/munira/MessageBubble.tsx
"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { t } from "@/theme";
import { TypingIndicator } from "./TypingIndicator";
import type { Message } from "@/hooks/useMuniraChat";

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
          background: isUser ? t.colors.cream.border : t.colors.primary[100],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          userSelect: "none",
          overflow: "hidden",
          border: isUser ? "none" : `1px solid ${t.colors.gold[400]}`,
        }}
      >
        {isUser ? (
          <User size={16} strokeWidth={1.8} color={t.colors.text.mid} />
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
          background: isUser ? t.colors.primary[800] : t.colors.white,
          border: isUser ? "none" : `1px solid ${message.error ? t.colors.semantic.danger : t.colors.cream.border}`,
          color: isUser ? t.colors.white : message.error ? t.colors.semantic.danger : t.colors.text.dark,
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