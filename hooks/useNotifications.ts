// hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export interface AppNotification {
  id: string;
  type: string;
  titleAr: string;
  titleEn: string | null;
  bodyAr: string;
  bodyEn: string | null;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  // ── initial fetch ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const res = await fetch("/api/notifications?limit=30");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Supabase Realtime subscription ────────────────────
  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();

    // إضافة قيمة عشوائية فريدة لاسم القناة لمنع تداخل القنوات المخزنة مؤقتاً
    const channelName = `notifications:${userId}_${Math.random().toString(36).substring(2, 9)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [userId]);

  // ── mark read ─────────────────────────────────────────
  const markRead = useCallback(async (ids?: string[]) => {
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids ? { ids } : {}),
    });
    setNotifications((prev) =>
      prev.map((n) =>
        !ids || ids.includes(n.id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount(ids ? (prev) => Math.max(0, prev - ids.length) : 0);
  }, []);

  const markAllRead = useCallback(() => markRead(), [markRead]);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications };
}