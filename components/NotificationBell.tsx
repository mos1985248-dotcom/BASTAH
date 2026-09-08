// components/NotificationBell.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ShoppingBag, CreditCard, Star, Store, Megaphone, Gem, Truck, Check, type LucideIcon } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { t } from "@/theme";

const TYPE_ICON: Record<string, LucideIcon> = {
  ORDER: ShoppingBag, PAYMENT: CreditCard, REVIEW: Star, STORE: Store,
  SYSTEM: Megaphone, SUBSCRIPTION: Gem, SHIPPING: Truck, DEFAULT: Bell,
};

interface Props { userId: string | undefined; }

export function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAllRead, markRead } = useNotifications(userId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((p) => !p)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 6 }}>
        <Bell size={20} strokeWidth={1.8} color={t.colors.text.body} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute", top: 2, insetInlineEnd: 2, minWidth: 16, height: 16,
              background: t.colors.semantic.danger, borderRadius: t.radius.full,
              fontSize: 9, color: t.colors.white, fontWeight: t.typography.fontWeight.bold,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 3px", border: `1.5px solid ${t.colors.white}`,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 8px)", insetInlineStart: "50%", transform: "translateX(-50%)",
            width: "min(360px, 90vw)", background: t.colors.white, borderRadius: t.radius.xl,
            boxShadow: t.shadows.lg, border: `1px solid ${t.colors.cream.border}`,
            zIndex: 500, maxHeight: "70vh", display: "flex", flexDirection: "column", direction: "rtl",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.colors.cream.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: t.spacing["2"], alignItems: "center" }}>
              <span style={{ fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>الإشعارات</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    width: 20, height: 20, background: t.colors.semantic.danger, borderRadius: t.radius.full,
                    fontSize: 10, color: t.colors.white, fontWeight: t.typography.fontWeight.bold,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={() => markAllRead()} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", fontSize: t.typography.fontSize.xs, color: t.colors.primary[800], cursor: "pointer", fontWeight: t.typography.fontWeight.bold }}>
                قراءة الكل
                <Check size={12} strokeWidth={2.2} />
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && <p style={{ textAlign: "center", padding: "30px 0", color: t.colors.text.light, fontSize: t.typography.fontSize.sm }}>جاري التحميل...</p>}
            {!loading && notifications.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Bell size={30} strokeWidth={1.5} color={t.colors.text.light} style={{ display: "block", margin: `0 auto ${t.spacing["2"]}` }} />
                <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.light }}>لا توجد إشعارات</p>
              </div>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead([n.id])}
                style={{
                  padding: "12px 14px", borderBottom: `1px solid ${t.colors.cream.borderLight}`,
                  background: n.isRead ? t.colors.white : t.colors.primary[50],
                  cursor: n.isRead ? "default" : "pointer", display: "flex", gap: t.spacing["2"], alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: t.radius.md, flexShrink: 0,
                    background: n.isRead ? t.colors.cream.bg : t.colors.primary[100],
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {(() => {
                    const Icon = TYPE_ICON[n.type] ?? TYPE_ICON.DEFAULT;
                    return <Icon size={17} strokeWidth={1.7} color={t.colors.primary[800]} />;
                  })()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.sm, fontWeight: n.isRead ? t.typography.fontWeight.medium : t.typography.fontWeight.bold, color: t.colors.text.dark }}>
                    {n.titleAr}
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.normal }}>
                    {n.bodyAr}
                  </p>
                  <span style={{ fontSize: 10, color: t.colors.text.light }}>
                    {new Date(n.createdAt).toLocaleString("ar-SA", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
                  </span>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: t.radius.full, background: t.colors.primary[800], flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
