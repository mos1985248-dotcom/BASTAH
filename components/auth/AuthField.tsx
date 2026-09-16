// components/auth/AuthField.tsx
// حقل إدخال موحّد لنماذج المصادقة.
// يدعم إظهار وإخفاء كلمة المرور عند استخدام type="password".

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { t } from "@/theme";

export default function AuthField({
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <label
      style={{
        display: "block",
        width: "100%",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 7,
          fontFamily: t.typography.fontFamily.base,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.semibold,
          color: t.colors.text.dark,
          lineHeight: 1.5,
        }}
      >
        {label}
      </span>

      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <input
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="basita-auth-field"
          style={{
            width: "100%",
            height: 48,
            padding: isPassword
              ? "0 46px 0 14px"
              : "0 14px",
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: 13,
            fontFamily: t.typography.fontFamily.base,
            fontSize: t.typography.fontSize.base,
            direction: "rtl",
            textAlign: "right",
            outline: "none",
            background: t.colors.cream.card,
            color: t.colors.text.dark,
            boxSizing: "border-box",
            transition:
              `border-color ${t.motion.base} ${t.motion.ease}, ` +
              `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
              `background ${t.motion.base} ${t.motion.ease}`,
          }}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={
              showPassword
                ? "إخفاء كلمة المرور"
                : "إظهار كلمة المرور"
            }
            onClick={() => setShowPassword((prev) => !prev)}
            className="basita-password-toggle"
            style={{
              position: "absolute",
              top: "50%",
              right: 7,
              transform: "translateY(-50%)",
              width: 34,
              height: 34,
              padding: 0,
              border: "none",
              borderRadius: 10,
              background: "transparent",
              color: t.colors.text.mid,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.8} />
            ) : (
              <Eye size={18} strokeWidth={1.8} />
            )}
          </button>
        )}
      </div>
    </label>
  );
}