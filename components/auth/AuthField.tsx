// components/auth/AuthField.tsx
// حقل إدخال موحّد لنماذج المصادقة. يدعم إظهار/إخفاء كلمة المرور عند type="password"،
// واتجاه LTR للبريد والجوال والرموز.
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import s from "./auth.module.css";

export default function AuthField({
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  ltr,
  inputMode,
  autoComplete,
  maxLength,
  hint,
  otp,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ltr?: boolean;
  inputMode?: "numeric" | "tel" | "email" | "text";
  autoComplete?: string;
  maxLength?: number;
  hint?: string;
  otp?: boolean;
}) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword && showPassword ? "text" : type;
  const forceLtr = ltr || type === "email" || otp;

  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>

      <div className={s.inputWrap}>
        <input
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`${s.input} ${forceLtr ? s.ltr : ""} ${isPassword ? s.withToggle : ""} ${otp ? s.otp : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            onClick={() => setShowPassword((prev) => !prev)}
            className={s.toggle}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
          </button>
        )}
      </div>

      {hint && <span className={s.hint}>{hint}</span>}
    </label>
  );
}
