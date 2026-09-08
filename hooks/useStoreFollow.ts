// hooks/useStoreFollow.ts
// يغلّف POST /api/stores/[slug]/follow (موجود أصلاً) — منطق واحد بدل
// تكراره بكل مكان يعرض زر "متابعة" لمتجر (Hero المتجر، بطاقة المتجر
// بصفحة المنتج).
"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { useCurrentUser } from "@/app/providers";

export function useStoreFollow(slug: string, initialFollowing: boolean, initialFollowers: number, redirectPath: string) {
  const { user } = useCurrentUser();
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
      return;
    }
    if (busy) return;
    setBusy(true);
    const prevFollowing = following;
    const prevFollowers = followers;
    setFollowing(!prevFollowing);
    setFollowers(prevFollowing ? Math.max(0, prevFollowers - 1) : prevFollowers + 1);
    try {
      const res = await api.post<{ following: boolean; totalFollowers: number }>(`/api/stores/${slug}/follow`, {});
      setFollowing(res.following);
      setFollowers(res.totalFollowers);
    } catch {
      setFollowing(prevFollowing);
      setFollowers(prevFollowers);
    } finally {
      setBusy(false);
    }
  };

  return { following, followers, busy, toggle };
}
