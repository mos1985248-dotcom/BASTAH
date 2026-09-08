// components/admin/ui/EmptyState.tsx
import { Inbox, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

export default function EmptyState({ icon: Icon = Inbox, message, action }: { icon?: LucideIcon; message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ textAlign: "center", padding: t.spacing["8"] }}>
      <Icon size={32} strokeWidth={1.5} color={t.colors.text.light} style={{ display: "block", margin: `0 auto ${t.spacing["2"]}` }} />
      <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.sm, margin: `0 0 ${action ? t.spacing["3"] : "0"}` }}>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          style={{ padding: "8px 18px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
