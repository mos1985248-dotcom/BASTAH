// components/dashboard/store-settings/Panel.tsx
// لوحة قسم واحد: رأس بأيقونة وعنوان ووصف، ثم المحتوى.
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import f from "../forms.module.css";
import s from "./settings.module.css";

export default function Panel({
  icon: Icon, title, description, tone, children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: "sand";
  children: ReactNode;
}) {
  return (
    <section className={f.panel}>
      <header className={f.panelHead}>
        <div className={s.headLead}>
          <span className={s.headIcon}>
            <Icon size={19} strokeWidth={1.8} />
          </span>
          <div>
            <h3 className={f.panelTitle}>{title}</h3>
            {description && <p className={f.panelSub}>{description}</p>}
          </div>
        </div>
      </header>
      <div className={`${f.panelBody} ${tone === "sand" ? s.sand : ""}`}>{children}</div>
    </section>
  );
}
