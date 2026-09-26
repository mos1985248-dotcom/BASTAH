// app/providers.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { api, ApiError } from "@/lib/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

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

  // ⚠️ إصلاح خلل تسجيل خروج معروف: أزرار الخروج (Navbar/AccountSidebar/
  // AdminSidebar) تستدعي supabase.auth.signOut() ثم router.push + refresh()،
  // لكن router.refresh() من Next.js يعيد تحميل بيانات Server Components فقط
  // ولا يُعيد تشغيل حالة هذا الـContext (client state)، فتبقى القائمة
  // الجانبية/اسم المستخدم ظاهرة كأن الدخول لا يزال قائماً حتى يُحدَّث
  // المتصفح يدوياً. الاشتراك هنا في onAuthStateChange نقطة مركزية واحدة
  // تُصلح كل أزرار الدخول/الخروج الحالية والمستقبلية دون تعديل كل واحد منها.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => subscription.subscription.unsubscribe();
  }, [refresh]);

  return <UserContext.Provider value={{ user, loading, refresh }}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(UserContext);
}
