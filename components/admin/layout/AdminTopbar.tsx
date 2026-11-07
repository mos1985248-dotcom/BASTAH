// components/admin/layout/AdminTopbar.tsx
import { ADMIN_SECTIONS, AdminSection } from "./sections";
import s from "../admin.module.css";

export default function AdminTopbar({ active }: { active: AdminSection }) {
  const section = ADMIN_SECTIONS.find((x) => x.id === active);

  return (
    <div className={s.top} dir="rtl">
      {section?.Icon && (
        <div className={s.topIcon} aria-hidden="true">
          <section.Icon size={20} strokeWidth={1.9} />
        </div>
      )}

      <div>
        <p className={s.topKicker}>لوحة إدارة بسطة مارت</p>
        <h1 className={s.topTitle}>{section?.label}</h1>
      </div>
    </div>
  );
}
