// components/auth/AuthFooterLine.tsx
import s from "./auth.module.css";

export default function AuthFooterLine({ prompt, linkLabel, href }: { prompt: string; linkLabel: string; href: string }) {
  return (
    <p className={s.foot}>
      {prompt}
      <a href={href}>{linkLabel}</a>
    </p>
  );
}
