// app/providers.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api-client";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
  isVerified: boolean;
  store: { id: string; slug: string; status: string } | null;
}

interface UserContextValue {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.get<{ user: CurrentUser }>("/api/auth/me");
      setUser(user);
    } catch (err) {
      // 401 يعني زائر غير مسجّل — ليست حالة خطأ تستدعي إيقاف التطبيق
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error("[UserProvider]", err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <UserContext.Provider value={{ user, loading, refresh }}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(UserContext);
}
