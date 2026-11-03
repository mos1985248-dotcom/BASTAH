// components/auth/AuthMethodTabs.tsx — تبديل طريقة الدخول/التسجيل: بريد أو جوال.
import { Mail, Smartphone } from "lucide-react";
import s from "./auth.module.css";

export type AuthMethod = "email" | "phone";

export default function AuthMethodTabs({ value, onChange }: { value: AuthMethod; onChange: (v: AuthMethod) => void }) {
  const items: { id: AuthMethod; label: string; Icon: typeof Mail }[] = [
    { id: "email", label: "البريد الإلكتروني", Icon: Mail },
    { id: "phone", label: "رقم الجوال", Icon: Smartphone },
  ];

  return (
    <div className={s.tabs} role="tablist" aria-label="طريقة المتابعة">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`${s.tab} ${value === id ? s.tabOn : ""}`}
        >
          <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
