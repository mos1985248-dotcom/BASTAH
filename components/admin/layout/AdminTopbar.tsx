// components/admin/layout/AdminTopbar.tsx
import { t } from "@/theme";
import { ADMIN_SECTIONS, AdminSection } from "./sections";

export default function AdminTopbar({ active }: { active: AdminSection }) {
  const section = ADMIN_SECTIONS.find((s) => s.id === active);
  return (
    <div
      style={{
        background: t.colors.white,
        borderBottom: `1px solid ${t.colors.cream.border}`,
        padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {section?.Icon && <section.Icon size={20} strokeWidth={2} />}
      <h1 style={{ margin: 0, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{section?.label}</h1>
    </div>
  );
}

