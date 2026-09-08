// components/munira/TypingIndicator.tsx
"use client";

import { t } from "@/theme";

export function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "8px 12px", alignItems: "center", direction: "rtl" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: t.radius.full,
            background: t.colors.gold[600],
            display: "inline-block",
            animation: `munira-bounce 1s ${i * 0.18}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes munira-bounce {
          0%,80%,100%{transform:translateY(0);opacity:.6}
          40%{transform:translateY(-6px);opacity:1}
        }
      `}</style>
    </div>
  );
}