// components/admin/UsersTab.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";

const ROLE_BADGE: Record<string, { color: string; bg: string }> = {
  BUYER: { color: t.colors.text.mid, bg: t.colors.cream.bg },
  SELLER: { color: t.colors.primary[800], bg: t.colors.primary[100] },
  ADMIN: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  SUPER_ADMIN: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
};

export default function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);

  const load = async (s = search) => {
    setLoading(true);
    setError(false);
    try {
      const qs = new URLSearchParams({ limit: "20", ...(s ? { search: s } : {}) });
      const d = await api.get<any>(`/api/admin/users?${qs}`);
      setUsers(d.users);
      setTotal(d.pagination.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: t.spacing["2"], marginBottom: t.spacing["3"] }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          placeholder="بحث بالاسم أو الإيميل..."
          style={{ flex: 1, padding: "9px 14px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, direction: "rtl" }}
        />
        <button onClick={() => load(search)} style={{ padding: "9px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, cursor: "pointer", fontSize: t.typography.fontSize.xs }}>
          بحث
        </button>
      </div>
      <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, marginBottom: t.spacing["2"] }}>{total} مستخدم</p>
      {loading && <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>جاري التحميل...</p>}
      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs }}>
          <AlertTriangle size={14} strokeWidth={1.8} />
          تعذّر تحميل المستخدمين
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["1"] }}>
        {users.map((u) => {
          const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.BUYER;
          return (
            <div key={u.id} style={{ background: t.colors.white, borderRadius: t.radius.md, padding: "10px 14px", border: `1px solid ${t.colors.cream.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
                  {u.name} {!u.isActive && <span style={{ color: t.colors.semantic.danger, fontSize: 10 }}>• موقوف</span>}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: t.colors.text.mid }}>
                  {u.email} {u.store && `· متجر: ${u.store.nameAr}`}
                </p>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: t.radius.sm, background: badge.bg, color: badge.color, fontSize: 10, fontWeight: t.typography.fontWeight.bold }}>{u.role}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
