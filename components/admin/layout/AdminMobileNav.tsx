// components/admin/layout/AdminMobileNav.tsx
import { t } from "@/theme";
import { ADMIN_SECTIONS, AdminSection } from "./sections";

export default function AdminMobileNav({
  active,
  onChange,
  ticketBadge,
}: {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  ticketBadge: number;
}) {
  return (
    <nav
      className="basita-admin-mobile-nav"
      aria-label="التنقل في لوحة الإدارة"
      style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        insetInline: 0,
        background: t.colors.primary[950],
        borderTop: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.14)",
        overflowX: "auto",
        zIndex: 60,
        padding: "6px 6px calc(6px + env(safe-area-inset-bottom))",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 3,
          minWidth: "100%",
          direction: "rtl",
        }}
      >
        {ADMIN_SECTIONS.map((s) => {
          const isActive = active === s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              aria-current={isActive ? "page" : undefined}
              style={{
                flex: "1 0 68px",
                minHeight: 54,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "5px 6px",
                background: isActive
                  ? "rgba(255,255,255,0.075)"
                  : "transparent",
                border: "1px solid transparent",
                borderRadius: t.radius.md,
                color: isActive
                  ? t.colors.gold[400]
                  : t.colors.text.onDarkMuted,
                cursor: "pointer",
                position: "relative",
                transition:
                  "background 160ms ease, color 160ms ease, transform 160ms ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* مؤشر الحالة النشطة */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  insetInline: "30%",
                  height: 2,
                  borderRadius: t.radius.full,
                  background: isActive
                    ? t.colors.gold[400]
                    : "transparent",
                }}
              />

              <span
                aria-hidden="true"
                style={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.sm,
                  background: isActive
                    ? "rgba(255,255,255,0.07)"
                    : "transparent",
                }}
              >
                <s.Icon size={17} strokeWidth={isActive ? 2.1 : 1.8} />
              </span>

              <span
                style={{
                  fontSize: 9.5,
                  lineHeight: 1.2,
                  fontWeight: isActive
                    ? t.typography.fontWeight.bold
                    : t.typography.fontWeight.regular,
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </span>

              {s.id === "support" && ticketBadge > 0 && (
                <span
                  aria-label={`${ticketBadge} تذاكر دعم`}
                  style={{
                    position: "absolute",
                    top: 3,
                    insetInlineEnd: 7,
                    minWidth: 15,
                    height: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: t.colors.semantic.danger,
                    color: t.colors.white,
                    fontSize: 8,
                    lineHeight: 1,
                    fontWeight: t.typography.fontWeight.bold,
                    borderRadius: t.radius.full,
                    padding: "0 4px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                  }}
                >
                  {ticketBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        .basita-admin-mobile-nav button:hover {
          background: rgba(255,255,255,0.055) !important;
        }

        .basita-admin-mobile-nav button:active {
          transform: scale(0.96);
        }

        .basita-admin-mobile-nav button:focus-visible {
          outline: 2px solid ${t.colors.gold[400]};
          outline-offset: -2px;
        }

        @media (max-width: 900px) {
          .basita-admin-mobile-nav {
            display: block !important;
          }
        }

        @media (max-width: 420px) {
          .basita-admin-mobile-nav {
            padding-inline: 3px;
          }

          .basita-admin-mobile-nav button {
            flex-basis: 62px !important;
            min-height: 52px !important;
            padding-inline: 4px !important;
          }
        }
      `}</style>
    </nav>
  );
}