// components/auth/AuthButton.tsx — الزر الأساسي لنماذج المصادقة.
import type { ReactNode } from "react";
import s from "./auth.module.css";

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
    <button type="button" onClick={onClick} disabled={loading} className={s.btn}>
      {loading ? loadingLabel : idleLabel}
    </button>
  );
}
