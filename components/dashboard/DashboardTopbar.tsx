// components/dashboard/DashboardTopbar.tsx
import { UserRound } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import { NotificationBell } from "@/components/NotificationBell";
import s from "./dash.module.css";

export default function DashboardTopbar({ userId, userName }: { userId: string | undefined; userName: string | undefined }) {
  return (
    <header className={s.topbar} style={uiVars}>
      <div className={s.hello}>
        <span className={s.helloAvatar}><UserRound size={18} strokeWidth={1.8} aria-hidden="true" /></span>
        <span>
          مرحبًا <span className={s.helloName}>{userName ?? "..."}</span>
        </span>
      </div>
      <NotificationBell userId={userId} />
    </header>
  );
}
