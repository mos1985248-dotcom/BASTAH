// hooks/useMuniraChat.ts
"use client";

import { useState, useCallback, useRef } from "react";
import { sendMessage, transcribeVoice } from "@/services/munira-client";
import type { APIMessage } from "@/services/munira-client";

export type MessageRole = "user" | "assistant";
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  pending?: boolean; // streaming لم يكتمل بعد
  error?: boolean;
}

interface Options {
  userType?: "guest" | "buyer" | "seller" | "admin";
  preferredLanguage?: string;
}

export function useMuniraChat(options: Options = {}) {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const sessionIdRef    = useRef<string | null>(null);
  const mediaRef        = useRef<MediaRecorder | null>(null);
  const audioChunksRef  = useRef<Blob[]>([]);
  const abortRef        = useRef<AbortController | null>(null);

  // ── helpers ──────────────────────────────────────────────
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const apiHistory = useCallback(
    (msgs: Message[]): APIMessage[] =>
      msgs.filter((m) => !m.error && !m.pending).slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    []
  );

  // ── core send ─────────────────────────────────────────────
  const _stream = useCallback(
    async (text: string, historySnapshot: Message[]) => {
      setError(null);
      setStreaming(true);

      const assistantId = uid();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", pending: true }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const history = [...apiHistory(historySnapshot), { role: "user" as const, content: text }];

        for await (const chunk of sendMessage({
          messages: history,
          sessionId: sessionIdRef.current,
          userType: options.userType ?? "guest",
          preferredLanguage: options.preferredLanguage,
          signal: controller.signal,
        })) {
          if (chunk.sessionId) sessionIdRef.current = chunk.sessionId;

          if (chunk.type === "error") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: chunk.error ?? "خطأ غير معروف", pending: false, error: true }
                  : m
              )
            );
            setError(chunk.error ?? "حدث خطأ");
            return;
          }

          if (chunk.type === "delta" && chunk.text) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk.text } : m
              )
            );
          }

          if (chunk.type === "done") break;
        }

        // Mark as complete
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m))
        );
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // المستخدم ألغى الطلب بنفسه — نُبقي أي نص وصل جزئياً، أو نحذف
          // الفقاعة كلياً لو لم يصل شيء بعد
          setMessages((prev) =>
            prev
              .map((m) => (m.id === assistantId ? { ...m, pending: false } : m))
              .filter((m) => m.id !== assistantId || m.content.trim().length > 0)
          );
        } else {
          const msg = err?.message ?? "حدث خطأ غير متوقع";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: msg, pending: false, error: true } : m
            )
          );
          setError(msg);
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [apiHistory, options]
  );

  // ── public: send text ─────────────────────────────────────
  const send = useCallback(
    (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: Message = { id: uid(), role: "user", content: text.trim() };
      // Optimistic: add user message immediately before awaiting stream
      setMessages((prev) => {
        const next = [...prev, userMsg];
        _stream(text.trim(), next);
        return next;
      });
    },
    [streaming, _stream]
  );

  // ── public: retry last failed message ────────────────────
  const retry = useCallback(() => {
    // Find last user message, remove last assistant error, re-stream
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const withoutLastAssistant = messages.filter(
      (m, i) => !(m.error && m.role === "assistant" && i === messages.length - 1)
    );
    setMessages(withoutLastAssistant);
    setError(null);
    _stream(lastUser.content, withoutLastAssistant.filter((m) => m.id !== lastUser.id));
  }, [messages, _stream]);

  // ── public: voice recording ───────────────────────────────
  const startRecording = useCallback(async () => {
    if (streaming || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      setError("تعذّر الوصول للميكروفون");
    }
  }, [streaming, recording]);

  const stopRecording = useCallback(async () => {
    if (!mediaRef.current || !recording) return;
    setRecording(false);

    return new Promise<void>((resolve) => {
      mediaRef.current!.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        mediaRef.current!.stream.getTracks().forEach((t) => t.stop());
        try {
          const result = await transcribeVoice(blob);
          if (result.transcript) send(result.transcript);
        } catch (err: any) {
          setError(err?.message ?? "فشل تحويل الصوت");
        }
        resolve();
      };
      mediaRef.current!.stop();
    });
  }, [recording, send]);

  // ── public: cancel in-flight streaming response ───────────
  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── public: clear ──────────────────────────────────────────
  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionIdRef.current = null;
  }, []);

  return {
    messages,
    streaming,
    recording,
    error,
    send,
    retry,
    clear,
    cancel,
    startRecording,
    stopRecording,
    sessionId: sessionIdRef.current,
  };
}
