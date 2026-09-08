// components/admin/StoresTab.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import StoreRow from "./StoreRow";

type Msg = { type: "error" | "success"; text: string } | null;

export default function StoresTab() {
  const [stores, setStores] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);

  const load = useCallback(async (p = 1, s = search) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(p), limit: "20", ...(s ? { search: s } : {}) });
      const data = await api.get<any>(`/api/admin/stores?${qs}`);
      setStores(data.stores);
      setTotal(data.pagination.total);
      setPage(p);
    } catch {
      setMsg({ type: "error", text: "تعذّر تحميل المتاجر" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const action = async (storeId: string, endpoint: string, body: object) => {
    setBusy(storeId);
    setMsg(null);
    try {
      await api.post(endpoint, body);
      setMsg({ type: "success", text: "تم" });
      load(page);
    } catch (e: any) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: t.spacing["2"], marginBottom: t.spacing["3"] }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1, search)}
          placeholder="ابحث باسم أو إيميل..."
          style={{ flex: 1, padding: "9px 14px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, direction: "rtl" }}
        />
        <button onClick={() => load(1, search)} style={{ padding: "9px 16px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, cursor: "pointer", fontSize: t.typography.fontSize.xs }}>
          بحث
        </button>
      </div>

      {msg && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.xs, color: msg.type === "error" ? t.colors.semantic.danger : t.colors.text.mid, marginBottom: t.spacing["2"] }}>
          {msg.type === "error" ? <AlertTriangle size={14} strokeWidth={1.8} /> : <CheckCircle2 size={14} strokeWidth={1.8} />}
          {msg.text}
        </p>
      )}
      {loading && <p style={{ color: t.colors.text.mid, fontSize: t.typography.fontSize.xs }}>جاري التحميل...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        {stores.map((s) => (
          <StoreRow key={s.id} store={s} busy={busy === s.id} onAction={(endpoint, body) => action(s.id, endpoint, body)} />
        ))}
      </div>

      {total > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: t.spacing["3"] }}>
          {Array.from({ length: Math.min(10, Math.ceil(total / 20)) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => load(p)}
              style={{ width: 28, height: 28, borderRadius: t.radius.full, background: p === page ? t.colors.primary[800] : t.colors.white, color: p === page ? t.colors.white : t.colors.text.mid, border: `1px solid ${t.colors.cream.border}`, cursor: "pointer", fontSize: 11 }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
