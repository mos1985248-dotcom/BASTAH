// app/dashboard/munira/page.tsx
// صفحة منيرة — لا منطق أعمال هنا على الإطلاق.
// كل المنطق في hooks/useMuniraChat.ts والتواصل في services/munira-client.ts
"use client";

import { useCallback } from "react";
import { useMuniraChat } from "@/hooks/useMuniraChat";
import { ChatWindow } from "@/components/munira/ChatWindow";
import { useCurrentUser } from "@/app/providers";
import { t } from "@/theme";

export default function MuniraPage() {
  const { user } = useCurrentUser();

  const role =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? "admin"
    : user?.role === "SELLER" ? "seller"
    : user ? "buyer"
    : "guest";

  const {
    messages, streaming, recording, error,
    send, retry, clear, cancel,
    startRecording, stopRecording,
  } = useMuniraChat({ userType: role });

  const handleCancel = useCallback(() => {
    if (streaming) { cancel(); return; }
    if (recording) stopRecording();
  }, [streaming, cancel, recording, stopRecording]);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <ChatWindow
        messages={messages}
        streaming={streaming}
        recording={recording}
        error={error}
        onSend={send}
        onRetry={retry}
        onClear={clear}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onCancel={handleCancel}
        userName={user?.name}
      />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${t.colors.cream.border}; border-radius: 4px; }
      `}</style>
    </div>
  );
}
