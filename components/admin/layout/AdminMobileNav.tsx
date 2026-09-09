// components/admin/layout/AdminMobileNav.tsx
import { t } from "@/theme";
import { ADMIN_SECTIONS, AdminSection } from "./sections";

export default function AdminMobileNav({ active, onChange, ticketBadge }: { active: AdminSection; onChange: (s: AdminSection) => void; ticketBadge: number }) {
  return (
    <nav
      className="basita-admin-mobile-nav"
      style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        insetInline: 0,
        background: t.colors.primary[950],
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflowX: "auto",
        zIndex: 60,
        padding: "6px 4px",
      }}
    >
      <div style={{ display: "flex", gap: 2 }}>
        {ADMIN_SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              style={{
                flex: "1 0 68px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 4px",
                background: "none",
                border: "none",
                color: isActive ? t.colors.gold[400] : t.colors.text.onDarkMuted,
                cursor: "pointer",
                position: "relative",
              }}
            >
             <s.Icon size={17} strokeWidth={2} />
              <span style={{ fontSize: 9.5, fontWeight: isActive ? t.typography.fontWeight.bold : t.typography.fontWeight.regular, whiteSpace: "nowrap" }}>{s.label}</span>
              {s.id === "support" && ticketBadge > 0 && (
                <span style={{ position: "absolute", top: 2, insetInlineEnd: 10, background: t.colors.semantic.danger, color: t.colors.white, fontSize: 8, borderRadius: t.radius.full, padding: "0 4px" }}>
                  {ticketBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .basita-admin-mobile-nav { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
