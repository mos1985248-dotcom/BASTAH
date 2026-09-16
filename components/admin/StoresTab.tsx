// components/admin/StoresTab.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Store,
} from "lucide-react";
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
      const qs = new URLSearchParams({
        page: String(p),
        limit: "20",
        ...(s ? { search: s } : {}),
      });

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

  const action = async (
    storeId: string,
    endpoint: string,
    body: object
  ) => {
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
    <div dir="rtl" style={{ width: "100%" }}>
      {/* شريط البحث */}
      <div
        className="basita-stores-search"
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 9,
          marginBottom: t.spacing["3"],
          padding: 8,
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.md,
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Search
            size={15}
            strokeWidth={1.8}
            color={t.colors.text.light}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && load(1, search)
            }
            placeholder="ابحث باسم أو إيميل..."
            aria-label="البحث في المتاجر"
            style={{
              width: "100%",
              height: 38,
              boxSizing: "border-box",
              padding: "0 36px 0 13px",
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: t.radius.sm,
              outline: "none",
              background: t.colors.cream.bg,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.xs,
              direction: "rtl",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => load(1, search)}
          aria-label="بحث"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            minWidth: 72,
            height: 38,
            padding: "0 15px",
            background: t.colors.primary[800],
            color: t.colors.white,
            border: "none",
            borderRadius: t.radius.sm,
            cursor: "pointer",
            fontSize: t.typography.fontSize.xs,
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "transform 150ms ease, opacity 150ms ease",
          }}
        >
          <Search size={14} strokeWidth={2} />
          بحث
        </button>
      </div>

      {/* الرسالة */}
      {msg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "11px 13px",
            marginBottom: t.spacing["2"],
            borderRadius: t.radius.md,
            border: `1px solid ${t.colors.cream.border}`,
            background: t.colors.white,
            color:
              msg.type === "error"
                ? t.colors.semantic.danger
                : t.colors.semantic.success,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background:
                msg.type === "error"
                  ? t.colors.semantic.dangerBg
                  : t.colors.semantic.successBg,
            }}
          >
            {msg.type === "error" ? (
              <AlertTriangle size={14} strokeWidth={1.8} />
            ) : (
              <CheckCircle2 size={14} strokeWidth={1.8} />
            )}
          </span>

          <span>{msg.text}</span>
        </div>
      )}

      {/* التحميل */}
      {loading && (
        <div
          style={{
            minHeight: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: t.spacing["2"],
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          جاري تحميل المتاجر...
        </div>
      )}

      {/* قائمة المتاجر */}
      {!loading && stores.length === 0 && (
        <div
          style={{
            minHeight: 145,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 20,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: t.colors.cream.bg,
              color: t.colors.primary[800],
            }}
          >
            <Store size={19} strokeWidth={1.7} />
          </div>

          <p
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.xs,
              fontWeight: 600,
              color: t.colors.text.dark,
            }}
          >
            لا توجد متاجر
          </p>

          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: t.colors.text.mid,
            }}
          >
            لم يتم العثور على متاجر مطابقة للبحث
          </p>
        </div>
      )}

      {!loading && stores.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: t.spacing["2"],
          }}
        >
          {stores.map((s) => (
            <StoreRow
              key={s.id}
              store={s}
              busy={busy === s.id}
              onAction={(endpoint, body) =>
                action(s.id, endpoint, body)
              }
            />
          ))}
        </div>
      )}

      {/* الترقيم */}
      {total > 20 && (
        <div
          className="basita-stores-pagination"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            marginTop: t.spacing["4"],
            paddingTop: t.spacing["3"],
            borderTop: `1px solid ${t.colors.cream.border}`,
          }}
        >
          {Array.from(
            {
              length: Math.min(10, Math.ceil(total / 20)),
            },
            (_, i) => i + 1
          ).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => load(p)}
              aria-label={`الصفحة ${p}`}
              aria-current={p === page ? "page" : undefined}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background:
                  p === page
                    ? t.colors.primary[800]
                    : t.colors.white,
                color:
                  p === page
                    ? t.colors.white
                    : t.colors.text.mid,
                border: `1px solid ${t.colors.cream.border}`,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: p === page ? 700 : 500,
                transition:
                  "transform 150ms ease, background 150ms ease",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .basita-stores-search input:focus {
          border-color: ${t.colors.primary[800]};
          background: ${t.colors.white};
          box-shadow: 0 0 0 3px ${t.colors.primary[800]}12;
        }

        .basita-stores-search button:hover {
          transform: translateY(-1px);
          opacity: 0.94;
        }

        .basita-stores-pagination button:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .basita-stores-search {
            padding: 7px !important;
          }

          .basita-stores-search button {
            min-width: 42px !important;
            padding: 0 11px !important;
          }
        }
      `}</style>
    </div>
  );
}