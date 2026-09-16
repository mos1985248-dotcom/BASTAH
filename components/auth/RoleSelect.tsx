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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: t.spacing["3"],
        direction: "rtl",
      }}
    >
      {OPTIONS.map((role) => {
        const active = value === role.id;

        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            aria-pressed={active}
            className="basita-role-option"
            style={{
              minHeight: 52,
              padding: "0 14px",
              borderRadius: 14,
              textAlign: "center",
              cursor: "pointer",
              fontFamily: t.typography.fontFamily.base,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              border: `1px solid ${
                active
                  ? t.colors.primary[700]
                  : t.colors.cream.border
              }`,
              background: active
                ? t.colors.primary[50]
                : t.colors.cream.card,
              color: active
                ? t.colors.primary[800]
                : t.colors.text.mid,
              boxShadow: active
                ? "0 4px 12px rgba(27,77,62,0.08)"
                : "none",
              transition:
                `background ${t.motion.base} ${t.motion.ease}, ` +
                `border-color ${t.motion.base} ${t.motion.ease}, ` +
                `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
                `transform ${t.motion.fast} ${t.motion.ease}`,
            }}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}