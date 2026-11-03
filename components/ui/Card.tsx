// components/ui/Card.tsx
import type { HTMLAttributes } from "react";
import { t } from "@/theme";
import { uiVars } from "./vars";
import s from "./ui.module.css";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "plain" | "outlined" | "deep";
  padding?: keyof typeof t.spacing;
};

export default function Card({ variant = "outlined", padding = "6", className, style, children, ...rest }: Props) {
  const cls = [s.card, variant === "outlined" && s.outlined, variant === "deep" && s.deep, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={{ ...uiVars, padding: t.spacing[padding], ...style }} {...rest}>
      {children}
    </div>
  );
}
