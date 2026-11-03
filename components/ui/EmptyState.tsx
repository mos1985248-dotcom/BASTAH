// components/ui/EmptyState.tsx
import type { ReactNode } from "react";
import { uiVars } from "./vars";
import s from "./ui.module.css";

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={s.empty} style={uiVars}>
      {icon}
      <h3 className={s.emptyTitle}>{title}</h3>
      {description && <p className={s.emptyText}>{description}</p>}
      {action}
    </div>
  );
}
