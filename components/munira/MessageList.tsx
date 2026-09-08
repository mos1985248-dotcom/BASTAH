// components/munira/MessageList.tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import type { Message } from "@/hooks/useMuniraChat";

const SUGGESTIONS = [
  "ابحثي لي عن هدية بأقل من 100 ريال",
  "كيف أضيف منتجاً جديداً؟",
  "أعطيني أفكاراً لحملة رمضان",
  "ترجمي وصف منتجي للإنجليزي",
];

interface Props {
  messages: Message[];
  streaming: boolean;
  error: string | null;
  onSuggestion: (text: string) => void;
  onRetry: () => void;
}

export function MessageList({ messages, streaming, error, onSuggestion, onRetry }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const isEmpty = messages.length === 0;
  const lastIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", direction: "rtl" }}>
      {isEmpty && (
        <div style={{ textAlign: "center", padding: "40px 20px 30px" }}>
          <div style={{ position: "relative", width: 68, height: 68, margin: "0 auto 14px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${t.colors.gold[400]}`, boxShadow: t.shadows.sm }}>
            <Image src="/images/munira-avatar.png" alt="منيرة" fill style={{ objectFit: "cover" }} />
          </div>
          <p style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], margin: "0 0 6px" }}>
            مرحباً! أنا منيرة
          </p>
          <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, margin: "0 0 24px", lineHeight: t.typography.lineHeight.relaxed }}>
            مساعدتك الذكية في بسطة — تسوّق، متجر، ترجمة، وأكثر
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: t.spacing["3"], justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="basita-btn-interactive"
                style={{
                  padding: "10px 16px",
                  background: t.colors.white,
                  border: `1px solid ${t.colors.cream.border}`,
                  borderRadius: t.radius.full,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: "pointer",
                  color: t.colors.primary[800],
                  boxShadow: t.shadows.sm,
                  transition: "all 0.2s ease",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {streaming && lastIsUser && (
        <div style={{ display: "flex", gap: t.spacing["3"], alignItems: "flex-end", marginBottom: 16, padding: "0 4px" }}>
          <div style={{ position: "relative", width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: `1px solid ${t.colors.gold[400]}`, flexShrink: 0 }}>
            <Image src="/images/munira-avatar.png" alt="منيرة" fill style={{ objectFit: "cover" }} />
          </div>
          <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, boxShadow: t.shadows.sm }}>
            <TypingIndicator />
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: t.colors.semantic.dangerBg, borderRadius: t.radius.lg, padding: "12px 16px", margin: "8px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${t.colors.semantic.danger}` }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.medium }}>
            <AlertTriangle size={15} strokeWidth={1.8} />
            {error}
          </span>
          <button
            onClick={onRetry}
            className="basita-btn-interactive"
            style={{ padding: "6px 14px", background: t.colors.semantic.danger, color: t.colors.white, border: "none", borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: "pointer" }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}