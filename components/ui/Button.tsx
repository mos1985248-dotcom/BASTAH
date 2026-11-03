// components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { uiVars } from "./vars";
import s from "./ui.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "green" | "gold" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "green", size = "md", loading, fullWidth, disabled, className, style, children, type = "button", ...rest },
  ref,
) {
  const cls = [s.btn, s[variant], size !== "md" && s[size], fullWidth && s.full, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      ref={ref}
      type={type}
      className={cls}
      style={{ ...uiVars, ...style }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={s.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
});

export default Button;
