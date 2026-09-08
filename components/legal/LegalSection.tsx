// components/legal/LegalSection.tsx
import { t } from "@/theme";

export default function LegalSection({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} style={{ marginBottom: t.spacing["6"] }}>
      <h2 style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], marginBottom: t.spacing["2"] }}>
        {title}
      </h2>
      <div style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed, display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        {children}
      </div>
    </section>
  );
}
