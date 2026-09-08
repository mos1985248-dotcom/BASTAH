// services/munira-client.ts
// طبقة الاتصال بـ API فقط — لا منطق أعمال، لا حالة.
// أي تغيير في الـ endpoint أو الـ headers يحدث هنا وحده.

export interface APIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChunk {
  type: "delta" | "done" | "error";
  text?: string;
  error?: string;
  sessionId?: string;
}

export interface TranscribeResult {
  transcript: string;
  detectedLanguage: string;
  isMixed: boolean;
}

/**
 * يرسل رسالة لمنيرة ويرجع AsyncGenerator يُصدر chunks نصية.
 * الـ sessionId يُستخرج من response headers ويُعاد للـ hook.
 */
export async function* sendMessage(params: {
  messages: APIMessage[];
  sessionId: string | null;
  userType: string;
  preferredLanguage?: string;
  signal?: AbortSignal;
}): AsyncGenerator<StreamChunk> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-type": params.userType,
    },
    body: JSON.stringify({
      messages: params.messages,
      sessionId: params.sessionId,
      preferredLanguage: params.preferredLanguage,
    }),
    signal: params.signal,
  });

  // تمرير sessionId من الـ header أولاً
  const newSessionId = res.headers.get("x-session-id");
  if (newSessionId) {
    yield { type: "delta", sessionId: newSessionId };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    yield { type: "error", error: body?.error ?? `HTTP ${res.status}` };
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) { yield { type: "error", error: "لا يوجد response body" }; return; }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") { yield { type: "done" }; return; }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) { yield { type: "error", error: parsed.error }; return; }
          const text = parsed.delta?.text;
          if (text) yield { type: "delta", text };
        } catch {}
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: "done" };
}

/** يرفع ملف صوتي ويرجع النص المُحوَّل */
export async function transcribeVoice(audioBlob: Blob): Promise<TranscribeResult> {
  const fd = new FormData();
  fd.append("audio", audioBlob, "recording.webm");
  const res = await fetch("/api/ai/voice", { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "فشل تحويل الصوت");
  }
  return res.json();
}

/** يجلب سجل محادثات المستخدم من الـ DB (مستقبلاً عبر GET /api/ai/sessions) */
export async function fetchSessions(): Promise<{ id: string; title: string | null; createdAt: string }[]> {
  // TODO: بناء GET /api/ai/sessions — يُعيد ChatSession[] للمستخدم الحالي
  // مؤجَّل حتى بناء صفحة الأرشيف الكاملة
  return [];
}
