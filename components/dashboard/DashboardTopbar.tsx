// components/dashboard/DashboardTopbar.tsx
import { UserRound } from "lucide-react";
import { t } from "@/theme";
import { NotificationBell } from "@/components/NotificationBell";

export default function DashboardTopbar({
  userId,
  userName,
}: {
  userId: string | undefined;
  userName: string | undefined;
}) {
  return (
    <div
      className="basita-dashboard-topbar"
      style={{
        background: t.colors.white,
        borderBottom: `1px solid ${t.colors.cream.border}`,
        padding: "10px 20px",
        minHeight: 64,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10,
        position: "sticky",
        top: 0,
        zIndex: 30,
        direction: "rtl",
      }}
    >
      {/* هوية المستخدم */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: t.colors.cream.warm,
            border: `1px solid ${t.colors.cream.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <UserRound
            size={18}
            strokeWidth={1.8}
            color={t.colors.primary[800]}
          />
        </div>

        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.light,
              lineHeight: 1.3,
              marginBottom: 2,
            }}
          >
            مرحبًا
          </div>

          <div
            style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 220,
            }}
          >
            {userName ?? "..."}
          </div>
        </div>
      </div>

      {/* الإشعارات */}
      <div
        style={{
          marginInlineStart: "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        <NotificationBell userId={userId} />
      </div>
    </div>
  );
}