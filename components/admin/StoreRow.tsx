// components/admin/StoreRow.tsx
import {
  BadgeCheck,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { t } from "@/theme";

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  ACTIVE: {
    color: t.colors.semantic.success,
    bg: t.colors.semantic.successBg,
  },
  SUSPENDED: {
    color: t.colors.semantic.danger,
    bg: t.colors.semantic.dangerBg,
  },
  PENDING: {
    color: t.colors.semantic.warning,
    bg: t.colors.semantic.warningBg,
  },
  CLOSED: {
    color: t.colors.text.light,
    bg: t.colors.cream.bg,
  },
};

const actionBtn = (color: string, bg: string): React.CSSProperties => ({
  minHeight: 30,
  padding: "0 10px",
  background: bg,
  color,
  border: "none",
  borderRadius: t.radius.sm,
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
  transition: "transform 150ms ease, opacity 150ms ease",
});

export default function StoreRow({
  store,
  busy,
  onAction,
}: {
  store: any;
  busy: boolean;
  onAction: (endpoint: string, body: object) => void;
}) {
  const badge = STATUS_BADGE[store.status] ?? STATUS_BADGE.CLOSED;

  return (
    <div
      className="basita-store-row"
      dir="rtl"
      style={{
        background: t.colors.white,
        borderRadius: t.radius.md,
        padding: "14px 16px",
        border: `1px solid ${t.colors.cream.border}`,
        transition:
          "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
      }}
    >
      {/* معلومات المتجر */}
      <div
        className="basita-store-main"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: t.spacing["3"],
          marginBottom: t.spacing["3"],
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 4,
              minWidth: 0,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
                lineHeight: 1.5,
                overflowWrap: "anywhere",
              }}
            >
              {store.nameAr}
            </p>

            {store.isVerified && (
              <BadgeCheck
                size={15}
                strokeWidth={1.8}
                color={t.colors.primary[800]}
                style={{ flexShrink: 0 }}
              />
            )}
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 10,
              lineHeight: 1.7,
              color: t.colors.text.mid,
              overflowWrap: "anywhere",
            }}
          >
            {store.user?.email} · {store.subscription?.plan ?? "-"} ·{" "}
            {store._count?.products ?? 0} منتج
          </p>
        </div>

        {/* حالة المتجر */}
        <span
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 26,
            padding: "0 10px",
            borderRadius: t.radius.full,
            background: badge.bg,
            color: badge.color,
            fontSize: 10,
            fontWeight: t.typography.fontWeight.bold,
            whiteSpace: "nowrap",
          }}
        >
          {store.status}
        </span>
      </div>

      {/* الإجراءات */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexWrap: "wrap",
          paddingTop: 10,
          borderTop: `1px solid ${t.colors.cream.border}`,
        }}
      >
        {store.verificationStatus === "PENDING_REVIEW" && (
          <>
            <button
              type="button"
              onClick={() =>
                onAction(`/api/admin/stores/${store.id}/verify`, {
                  action: "approve",
                })
              }
              disabled={busy}
              aria-label="قبول المتجر"
              style={{
                ...actionBtn(
                  t.colors.semantic.success,
                  t.colors.semantic.successBg
                ),
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                opacity: busy ? 0.55 : 1,
              }}
            >
              <CheckCircle2 size={13} strokeWidth={2} />
              قبول
            </button>

            <button
              type="button"
              onClick={() => {
                const r = prompt("سبب الرفض؟");
                if (r)
                  onAction(`/api/admin/stores/${store.id}/verify`, {
                    action: "reject",
                    reason: r,
                  });
              }}
              disabled={busy}
              aria-label="رفض المتجر"
              style={{
                ...actionBtn(
                  t.colors.semantic.danger,
                  t.colors.semantic.dangerBg
                ),
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                opacity: busy ? 0.55 : 1,
              }}
            >
              <XCircle size={13} strokeWidth={2} />
              رفض
            </button>
          </>
        )}

        {store.status === "ACTIVE" && (
          <button
            type="button"
            onClick={() => {
              const r = prompt("سبب التعليق؟");
              if (r)
                onAction(`/api/admin/stores/${store.id}/suspend`, {
                  action: "suspend",
                  reason: r,
                });
            }}
            disabled={busy}
            aria-label="تعليق المتجر"
            style={{
              ...actionBtn(
                t.colors.semantic.warning,
                t.colors.semantic.warningBg
              ),
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              opacity: busy ? 0.55 : 1,
            }}
          >
            <PauseCircle size={13} strokeWidth={2} />
            تعليق
          </button>
        )}

        {store.status === "SUSPENDED" && (
          <button
            type="button"
            onClick={() =>
              onAction(`/api/admin/stores/${store.id}/suspend`, {
                action: "reactivate",
              })
            }
            disabled={busy}
            aria-label="تفعيل المتجر"
            style={{
              ...actionBtn(
                t.colors.semantic.success,
                t.colors.semantic.successBg
              ),
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              opacity: busy ? 0.55 : 1,
            }}
          >
            <PlayCircle size={13} strokeWidth={2} />
            تفعيل
          </button>
        )}
      </div>

      <style>{`
        .basita-store-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(0, 0, 0, 0.055);
          border-color: ${t.colors.cream.border};
        }

        .basita-store-row button:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .basita-store-row button:disabled {
          cursor: not-allowed;
        }

        @media (max-width: 520px) {
          .basita-store-main {
            flex-direction: column !important;
            gap: 9px !important;
          }

          .basita-store-main > span {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}