// components/auth/RoleSelect.tsx
import s from "./auth.module.css";

const OPTIONS: { id: "SELLER" | "BUYER"; label: string }[] = [
  { id: "SELLER", label: "صاحب متجر" },
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
    <div className={s.roles} role="group" aria-label="نوع الحساب">
      {OPTIONS.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onChange(role.id)}
          aria-pressed={value === role.id}
          className={`${s.role} ${value === role.id ? s.roleOn : ""}`}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
