// components/account/RoleSwitchCard.tsx
// تبديل حساب تاجر ↔ مشتري. لا يظهر لـADMIN/SUPER_ADMIN (ليسا جزءاً من هذا
// النظام). عند التبديل الناجح نستدعي refresh() من UserProvider فوراً بدل
// انتظار تحديث الصفحة، فتنعكس القوائم/الروابط على الدور الجديد فوراً.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Repeat, Store, User as UserIcon, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import { useCurrentUser } from "@/app/providers";

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
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"], display: "flex", alignItems: "center", justifyContent: "space-between", gap: t.spacing["3"], flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: t.spacing["2"] }}>
        {isSeller ? <Store size={18} strokeWidth={1.8} color={t.colors.primary[800]} /> : <UserIcon size={18} strokeWidth={1.8} color={t.colors.primary[800]} />}
        <div>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            أنت الآن في وضع {isSeller ? "التاجر" : "المشتري"}
          </p>
          {error && (
            <p style={{ display: "flex", alignItems: "center", gap: 5, margin: "2px 0 0", fontSize: 11, color: t.colors.semantic.danger }}>
              <AlertTriangle size={11} strokeWidth={1.8} />
              {error}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={handleSwitch}
        disabled={loading}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: t.colors.primary[100], color: t.colors.primary[800], border: "none", borderRadius: t.radius.md, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: loading ? "not-allowed" : "pointer" }}
      >
        <Repeat size={13} strokeWidth={2} />
        {loading ? "جاري التبديل..." : `التبديل لحساب ${targetLabel}`}
      </button>
    </div>
  );
}
