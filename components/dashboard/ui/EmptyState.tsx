// components/dashboard/ui/EmptyState.tsx — نفس واجهة admin/ui/EmptyState
import { Inbox, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

export default function EmptyState({
  icon: Icon = Inbox,
  message,
  action,
}: {
  icon?: LucideIcon;
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className={`${s.center} ${s.centerCol}`} style={uiVars}>
      <Icon size={32} strokeWidth={1.5} color="var(--ui-kicker)" aria-hidden="true" />
      <p style={{ margin: 0 }}>{message}</p>
      {action && <button type="button" onClick={action.onClick} className={`${s.btnSm} ${s.btnPrimary}`}>{action.label}</button>}
    </div>
  );
}
