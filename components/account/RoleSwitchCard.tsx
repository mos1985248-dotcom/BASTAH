// components/account/RoleSwitchCard.tsx
// تبديل حساب تاجر ↔ مشتري. لا يظهر لـADMIN/SUPER_ADMIN (ليسا جزءاً من هذا
// النظام). عند التبديل الناجح نستدعي refresh() من UserProvider فوراً بدل
// انتظار تحديث الصفحة، فتنعكس القوائم/الروابط على الدور الجديد فوراً.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Repeat, Store, User as UserIcon, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "@/app/providers";
import s from "./account.module.css";

export default function RoleSwitchCard({ role }: { role: string }) {
  const router = useRouter();
  const { refresh } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (role !== "BUYER" && role !== "SELLER") return null;

  const isSeller = role === "SELLER";
  const targetLabel = isSeller ? "مشتري" : "تاجر";

  const handleSwitch = async () => {
    setLoading(true);
    setError("");
    try {
      await api.patch("/api/auth/switch-role", {});
      await refresh();
      router.push(isSeller ? "/account" : "/dashboard");
    } catch (err) {
      if (err instanceof ApiError && (err.details as any)?.needsStore) {
        router.push("/dashboard/create-store");
        return;
      }
      setError(err instanceof ApiError ? err.message : "تعذّر تبديل الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.role}>
      <div className={s.roleLead}>
        {isSeller ? <Store size={20} strokeWidth={1.8} aria-hidden="true" /> : <UserIcon size={20} strokeWidth={1.8} aria-hidden="true" />}
        <div>
          <p className={s.roleTitle}>أنت الآن في وضع {isSeller ? "التاجر" : "المشتري"}</p>
          {error && (
            <p className={s.roleErr} role="alert">
              <AlertTriangle size={13} strokeWidth={1.8} />
              {error}
            </p>
          )}
        </div>
      </div>
      <button type="button" onClick={handleSwitch} disabled={loading} className={s.switch}>
        <Repeat size={14} strokeWidth={2} />
        {loading ? "جاري التبديل..." : `التبديل لحساب ${targetLabel}`}
      </button>
    </div>
  );
}
