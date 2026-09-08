// components/auth/AuthButton.tsx
// زر الإجراء الأساسي في نماذج المصادقة.
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
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "13px",
        background: loading ? t.colors.primary[600] : t.colors.primary[800],
        border: "none",
        borderRadius: t.radius.md,
        fontSize: t.typography.fontSize.base,
        fontWeight: t.typography.fontWeight.bold,
        color: t.colors.text.onDark,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {loading ? loadingLabel : idleLabel}
    </button>
  );
}
