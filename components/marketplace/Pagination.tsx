// components/marketplace/Pagination.tsx
import { t } from "@/theme";

export default function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: t.spacing["2"], marginTop: t.spacing["8"] }}>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
        const active = p === page;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              width: 34,
              height: 34,
              borderRadius: t.radius.full,
              background: active ? t.colors.primary[800] : t.colors.white,
              color: active ? t.colors.text.onDark : t.colors.text.mid,
              border: `1px solid ${t.colors.cream.border}`,
              cursor: "pointer",
              fontSize: t.typography.fontSize.sm,
            }}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}
