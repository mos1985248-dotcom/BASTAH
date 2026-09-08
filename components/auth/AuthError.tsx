// components/auth/AuthError.tsx
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";

export default function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        margin: 0,
        padding: `${t.spacing["2"]} ${t.spacing["3"]}`,
        fontSize: t.typography.fontSize.sm,
        color: t.colors.semantic.danger,
        background: t.colors.semantic.dangerBg,
        borderRadius: t.radius.sm,
      }}
    >
      <AlertTriangle size={14} strokeWidth={1.8} />
      {message}
    </p>
  );
}
