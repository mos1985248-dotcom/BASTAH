// components/auth/AuthButton.tsx
// الزر الأساسي لنماذج المصادقة.

import type { ReactNode } from "react";
import { t } from "@/theme";

export default function AuthButton({
  onClick,
  loading,
  idleLabel,
  loadingLabel,
}: {
  onClick: () => void;
  loading: boolean;
  idleLabel: ReactNode;
  loadingLabel: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="basita-btn-interactive"
      style={{
        width: "100%",
        minHeight: 48,
        padding: "0 18px",
        background: loading
          ? t.colors.primary[600]
          : t.colors.primary[800],
        border: "none",
        borderRadius: 14,
        fontFamily: t.typography.fontFamily.base,
        fontSize: t.typography.fontSize.base,
        fontWeight: t.typography.fontWeight.bold,
        color: t.colors.text.onDark,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: loading
          ? "none"
          : "0 6px 14px rgba(18, 63, 50, 0.14)",
        transition:
          `background ${t.motion.base} ${t.motion.ease}, ` +
          `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
          `transform ${t.motion.fast} ${t.motion.ease}, ` +
          `opacity ${t.motion.fast} ${t.motion.ease}`,
      }}
    >
      {loading ? loadingLabel : idleLabel}
    </button>
  );
}