// components/admin/ui/StatusBadge.tsx
// لون الشارة قيمة ديناميكية من ثوابت الحالات (lib/*-status) فيبقى مضمّناً؛ والباقي بالفئة.
import s from "../admin-ui.module.css";

export default function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className={s.badge} style={{ background: bg, color }}>
      {label}
    </span>
  );
}
