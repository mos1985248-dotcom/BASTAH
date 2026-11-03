// components/ui/Input.tsx
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { uiVars } from "./vars";
import s from "./ui.module.css";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, id, className, style, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const noteId = error || hint ? `${inputId}-note` : undefined;
  return (
    <div style={uiVars}>
      {label && (
        <label className={s.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[s.input, error && s.invalid, className].filter(Boolean).join(" ")}
        style={style}
        aria-invalid={error ? true : undefined}
        aria-describedby={noteId}
        {...rest}
      />
      {error ? (
        <p id={noteId} className={s.error} role="alert">{error}</p>
      ) : hint ? (
        <p id={noteId} className={s.hint}>{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
