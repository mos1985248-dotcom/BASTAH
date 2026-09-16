// components/admin/UsersTab.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Search, Users, UserRound } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";

const ROLE_BADGE: Record<string, { color: string; bg: string }> = {
  BUYER: { color: t.colors.text.mid, bg: t.colors.cream.bg },
  SELLER: { color: t.colors.primary[800], bg: t.colors.primary[100] },
  ADMIN: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  SUPER_ADMIN: {
    color: t.colors.semantic.warning,
    bg: t.colors.semantic.warningBg,
  },
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
      const qs = new URLSearchParams({
        limit: "20",
        ...(s ? { search: s } : {}),
      });

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
    <div dir="rtl" style={{ width: "100%" }}>
      {/* شريط البحث */}
      <div
        className="basita-admin-users-search"
        style={{
          display: "flex",
          gap: t.spacing["2"],
          marginBottom: t.spacing["3"],
          padding: 6,
          background: t.colors.white,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
          boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
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
            style={{
              position: "absolute",
              right: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: t.colors.text.light,
              pointerEvents: "none",
            }}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
            placeholder="بحث بالاسم أو الإيميل..."
            aria-label="البحث عن مستخدم"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 38px 10px 14px",
              border: "none",
              outline: "none",
              background: "transparent",
              borderRadius: t.radius.md,
              fontSize: t.typography.fontSize.xs,
              direction: "rtl",
              color: t.colors.text.dark,
            }}
          />
        </div>

        <button
          onClick={() => load(search)}
          aria-label="بحث"
          style={{
            minWidth: 76,
            padding: "9px 16px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: t.colors.primary[800],
            color: t.colors.white,
            border: "none",
            borderRadius: t.radius.md,
            cursor: "pointer",
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.bold,
            transition: "all 160ms ease",
          }}
        >
          <Search size={14} strokeWidth={2} />
          بحث
        </button>
      </div>

      {/* رأس القائمة */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: t.spacing["2"],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.sm,
              background: t.colors.primary[50],
              color: t.colors.primary[800],
            }}
          >
            <Users size={16} strokeWidth={1.8} />
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
              }}
            >
              المستخدمون
            </p>

            <p
              style={{
                margin: "2px 0 0",
                fontSize: 10,
                color: t.colors.text.mid,
              }}
            >
              إدارة حسابات مستخدمي بسطة
            </p>
          </div>
        </div>

        <span
          style={{
            padding: "5px 10px",
            borderRadius: t.radius.full,
            background: t.colors.cream.bg,
            color: t.colors.text.mid,
            fontSize: 10,
            fontWeight: t.typography.fontWeight.bold,
            whiteSpace: "nowrap",
          }}
        >
          {total} مستخدم
        </span>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 100,
            marginBottom: t.spacing["2"],
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          <span>جاري تحميل المستخدمين...</span>
        </div>
      )}

      {/* الخطأ */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "11px 14px",
            marginBottom: t.spacing["2"],
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          <span
            style={{
              width: 29,
              height: 29,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: t.colors.semantic.dangerBg,
            }}
          >
            <AlertTriangle size={14} strokeWidth={1.8} />
          </span>

          <span>تعذّر تحميل المستخدمين</span>
        </div>
      )}

      {/* قائمة المستخدمين */}
      {!loading && !error && users.length === 0 ? (
        <div
          style={{
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 24,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.lg,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: t.colors.cream.bg,
              color: t.colors.text.light,
            }}
          >
            <UserRound size={20} strokeWidth={1.6} />
          </div>

          <p
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.sm,
              fontWeight: 600,
              color: t.colors.text.dark,
            }}
          >
            لا يوجد مستخدمون
          </p>

          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: t.colors.text.mid,
            }}
          >
            لم يتم العثور على مستخدمين مطابقين للبحث.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {users.map((u) => {
            const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.BUYER;

            return (
              <div
                key={u.id}
                className="basita-admin-user-row"
                style={{
                  background: t.colors.white,
                  borderRadius: t.radius.md,
                  padding: "12px 14px",
                  border: `1px solid ${t.colors.cream.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  minWidth: 0,
                  transition:
                    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                }}
              >
                {/* بيانات المستخدم */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: t.colors.cream.bg,
                      color: t.colors.primary[800],
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {u.name?.charAt(0)?.toUpperCase() || "؟"}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 3px",
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.bold,
                        color: t.colors.text.dark,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {u.name}{" "}
                      {!u.isActive && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            marginRight: 4,
                            padding: "2px 6px",
                            borderRadius: t.radius.full,
                            background: t.colors.semantic.dangerBg,
                            color: t.colors.semantic.danger,
                            fontSize: 9,
                            fontWeight: 600,
                            verticalAlign: "middle",
                          }}
                        >
                          موقوف
                        </span>
                      )}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 10,
                        lineHeight: 1.7,
                        color: t.colors.text.mid,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {u.email}
                      {u.store && ` · متجر: ${u.store.nameAr}`}
                    </p>
                  </div>
                </div>

                {/* الدور */}
                <span
                  style={{
                    flexShrink: 0,
                    padding: "5px 10px",
                    borderRadius: t.radius.full,
                    background: badge.bg,
                    color: badge.color,
                    fontSize: 9,
                    fontWeight: t.typography.fontWeight.bold,
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.role}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .basita-admin-user-row:hover {
          transform: translateY(-1px);
          border-color: ${t.colors.primary[100]};
          box-shadow: 0 5px 16px rgba(0, 0, 0, 0.045);
        }

        @media (max-width: 560px) {
          .basita-admin-users-search {
            padding: 5px !important;
          }

          .basita-admin-user-row {
            align-items: flex-start !important;
          }

          .basita-admin-user-row > span {
            margin-top: 2px;
          }
        }

        @media (max-width: 430px) {
          .basita-admin-users-search button {
            min-width: 48px !important;
            padding-left: 11px !important;
            padding-right: 11px !important;
            font-size: 0 !important;
          }

          .basita-admin-users-search button svg {
            margin: 0 !important;
          }

          .basita-admin-user-row {
            padding: 11px !important;
            gap: 9px !important;
          }
        }
      `}</style>
    </div>
  );
}