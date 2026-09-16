// components/admin/layout/AdminTopbar.tsx
import { t } from "@/theme";
import { ADMIN_SECTIONS, AdminSection } from "./sections";

export default function AdminTopbar({ active }: { active: AdminSection }) {
  const section = ADMIN_SECTIONS.find((s) => s.id === active);

  return (
    <div
      className="basita-admin-topbar"
      dir="rtl"
      style={{
        background: t.colors.white,
        borderBottom: `1px solid ${t.colors.cream.border}`,
        padding: `${t.spacing["3"]} ${t.spacing["5"]}`,
        minHeight: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
        }}
      >
        {section?.Icon && (
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.md,
              background: t.colors.primary[50],
              color: t.colors.primary[800],
              border: `1px solid ${t.colors.cream.border}`,
            }}
          >
            <section.Icon size={19} strokeWidth={1.9} />
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 2px",
              fontSize: 10,
              color: t.colors.text.light,
              fontWeight: t.typography.fontWeight.regular,
            }}
          >
            لوحة إدارة بسطة
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {section?.label}
          </h1>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: -1,
          insetInlineStart: t.spacing["5"],
          width: 42,
          height: 2,
          borderRadius: t.radius.full,
          background: t.colors.gold[600],
        }}
      />

      <style>{`
        @media (max-width: 700px) {
          .basita-admin-topbar {
            min-height: 62px !important;
            padding: 10px 14px !important;
          }

          .basita-admin-topbar h1 {
            font-size: ${t.typography.fontSize.lg} !important;
          }

          .basita-admin-topbar > div:first-child > div:first-child {
            width: 36px !important;
            height: 36px !important;
          }

          .basita-admin-topbar > div:first-child {
            gap: 9px !important;
          }

          .basita-admin-topbar > div:last-child {
            inset-inline-start: 14px !important;
          }
        }

        @media (max-width: 420px) {
          .basita-admin-topbar {
            min-height: 58px !important;
          }

          .basita-admin-topbar p {
            display: none;
          }

          .basita-admin-topbar h1 {
            font-size: ${t.typography.fontSize.base} !important;
          }
        }
      `}</style>
    </div>
  );
}