// components/dashboard/DashboardTopbar.tsx
import { t } from "@/theme";
import { NotificationBell } from "@/components/NotificationBell";

export default function DashboardTopbar({ userId, userName }: { userId: string | undefined; userName: string | undefined }) {
  return (
    <div
      style={{
        background: t.colors.white,
        borderBottom: `1px solid ${t.colors.cream.border}`,
        padding: `${t.spacing["3"]} ${t.spacing["5"]}`,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: t.spacing["3"],
        position: "sticky",
        top: 0,
        zIndex: 20,
        direction: "rtl",
      }}
    >
      <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.text.dark }}>
        {userName ?? "..."}
      </span>
      <NotificationBell userId={userId} />
    </div>
  );
}