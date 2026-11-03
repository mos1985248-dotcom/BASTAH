// components/ui/Badge.tsx
import type { HTMLAttributes } from "react";
import { uiVars } from "./vars";
import s from "./ui.module.css";

const tones = { gold: s.bGold, green: s.bGreen, sand: s.bSand, danger: s.bDanger } as const;

type Props = HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones };

export default function Badge({ tone = "sand", className, style, children, ...rest }: Props) {
  return (
    <span className={[s.badge, tones[tone], className].filter(Boolean).join(" ")} style={{ ...uiVars, ...style }} {...rest}>
      {children}
    </span>
  );
}
