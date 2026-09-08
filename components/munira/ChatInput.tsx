// components/munira/ChatInput.tsx
"use client";

import { useRef, useState } from "react";
import { Mic, Square, ArrowLeft } from "lucide-react";
import { t } from "@/theme";

interface Props {
  onSend: (text: string) => void;
  onCancel: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  streaming: boolean;
  recording: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onCancel, onStartRecording, onStopRecording, streaming, recording, disabled }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = value.trim();
    if (!text || streaming) return;
    setValue("");
    onSend(text);
    ref.current?.focus();
    if (ref.current) ref.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const canSend = value.trim().length > 0 && !streaming && !disabled;

  return (
    <div style={{ background: t.colors.white, borderTop: `1px solid ${t.colors.cream.border}`, padding: "12px 16px", display: "flex", gap: t.spacing["3"], alignItems: "flex-end", flexShrink: 0, direction: "rtl" }}>
      <button
        onClick={recording ? onStopRecording : onStartRecording}
        disabled={streaming || disabled}
        title={recording ? "إيقاف التسجيل" : "تسجيل صوتي"}
        className="basita-btn-interactive"
        style={{
          width: 40, height: 40, borderRadius: t.radius.full, flexShrink: 0,
          background: recording ? t.colors.semantic.dangerBg : t.colors.primary[100],
          border: recording ? `1.5px solid ${t.colors.semantic.danger}` : "none",
          cursor: streaming || disabled ? "not-allowed" : "pointer",
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          animation: recording ? "pulse-red 1s ease-in-out infinite" : "none",
        }}
      >
        {recording ? (
          <Square size={16} strokeWidth={2} fill={t.colors.semantic.danger} color={t.colors.semantic.danger} />
        ) : (
          <Mic size={18} strokeWidth={1.8} color={t.colors.primary[800]} />
        )}
      </button>

      <textarea
        ref={ref}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="اكتبي رسالتك... (Enter للإرسال)"
        rows={1}
        disabled={disabled}
        style={{
          flex: 1,
          padding: "10px 16px",
          border: `1.5px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.full,
          fontSize: t.typography.fontSize.sm,
          direction: "rtl",
          resize: "none",
          outline: "none",
          lineHeight: t.typography.lineHeight.normal,
          overflow: "hidden",
          background: disabled ? (t.colors.cream?.bg || "#f9f6f0") : t.colors.white,
          color: t.colors.text.body,
        }}
        onFocus={(e) => { e.target.style.borderColor = t.colors.primary[800]; }}
        onBlur={(e) => { e.target.style.borderColor = t.colors.cream.border; }}
      />

      {streaming ? (
        <button onClick={onCancel} title="إلغاء" className="basita-btn-interactive" style={{ width: 40, height: 40, borderRadius: t.radius.full, flexShrink: 0, background: t.colors.semantic.dangerBg, border: `1.5px solid ${t.colors.semantic.danger}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Square size={15} strokeWidth={2} fill={t.colors.semantic.danger} color={t.colors.semantic.danger} />
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!canSend}
          title="إرسال"
          className={canSend ? "basita-btn-interactive" : undefined}
          style={{
            width: 40, height: 40, borderRadius: t.radius.full, flexShrink: 0,
            background: canSend ? t.colors.primary[800] : t.colors.cream.border,
            border: "none",
            cursor: canSend ? "pointer" : "not-allowed",
            fontSize: 16, color: canSend ? t.colors.white : t.colors.text.light,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
        </button>
      )}

      <style>{`
        @keyframes pulse-red {
          0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.3)}
          50%{box-shadow:0 0 0 6px rgba(220,38,38,0)}
        }
      `}</style>
    </div>
  );
}