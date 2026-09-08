// components/about/StorySection.tsx
import { t } from "@/theme";

export default function StorySection({
  title,
  children,
  alt,
  id,
}: {
  title?: string;
  children: React.ReactNode;
  alt?: boolean;
  id?: string;
}) {
  return (
    <section id={id} style={{ background: alt ? (t.colors.cream?.warm || "#fdfbf7") : "transparent", padding: `${t.spacing["16"]} ${t.spacing["4"]}`, direction: "rtl" }}>
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        {title && (
          <h2 style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize["2xl"], fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
            {title}
          </h2>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"], fontSize: t.typography.fontSize.base, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
          {children}
        </div>
      </div>
    </section>
  );
}