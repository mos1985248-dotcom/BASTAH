// components/auth/AuthError.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

export default function AuthError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        margin: 0,
        padding: `${t.spacing["3"]} ${t.spacing["3"]}`,
        fontSize: t.typography.fontSize.sm,
        lineHeight: t.typography.lineHeight.relaxed,
        color: t.colors.semantic.danger,
        background: t.colors.semantic.dangerBg,
        border: `1px solid rgba(220, 38, 38, 0.12)`,
        borderRight: `3px solid ${t.colors.semantic.danger}`,
        borderRadius: 12,
        boxSizing: "border-box",
      }}
    >
      <AlertTriangle
        size={17}
        strokeWidth={1.9}
        style={{
          flexShrink: 0,
          marginTop: 2,
        }}
      />

      <span>{message}</span>
    </div>
  );
}