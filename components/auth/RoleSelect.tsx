// components/auth/RoleSelect.tsx
import { t } from "@/theme";

const OPTIONS: { id: "SELLER" | "BUYER"; label: string }[] = [
  { id: "SELLER", label: "صاحب/ة متجر" },
  { id: "BUYER", label: "مشتري" },
];

export default function RoleSelect({
  value,
  onChange,
}: {
  value: "SELLER" | "BUYER";
  onChange: (v: "SELLER" | "BUYER") => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["2"] }}>
      {OPTIONS.map((r) => {
        const active = value === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            style={{
              padding: t.spacing["3"],
              borderRadius: t.radius.md,
              textAlign: "center",
              cursor: "pointer",
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.semibold,
              border: `2px solid ${active ? t.colors.primary[800] : t.colors.cream.border}`,
              background: active ? t.colors.primary[100] : t.colors.white,
              color: active ? t.colors.primary[800] : t.colors.text.mid,
              transition: "all 0.15s ease",
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
