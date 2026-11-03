// components/admin/layout/AdminMobileNav.tsx — شريط تنقل سفلي بالجوال والتابلت الصغير (≤ 900px).
import { ADMIN_SECTIONS, AdminSection } from "./sections";
import s from "../admin.module.css";

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
    <nav className={s.mnav} aria-label="التنقل في لوحة الإدارة">
      <div className={s.mRow}>
        {ADMIN_SECTIONS.map((sec) => {
          const isActive = active === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onChange(sec.id)}
              aria-current={isActive ? "page" : undefined}
              className={`${s.mItem} ${isActive ? s.mOn : ""}`}
            >
              <sec.Icon size={20} strokeWidth={isActive ? 2.1 : 1.8} aria-hidden="true" />
              <span>{sec.label}</span>
              {sec.id === "support" && ticketBadge > 0 && (
                <span className={s.mCount} aria-label={`${ticketBadge} تذاكر دعم`}>
                  {ticketBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
