// components/ui/vars.ts
// جسر بين theme/ وملف ui.module.css:
// الألوان تُمرَّر كمتغيرات CSS من theme/ حتى تعمل حالات hover وfocus
// دون كتابة أي لون hex داخل المكوّنات.
import type { CSSProperties } from "react";
import { t } from "@/theme";

const h = t.colors.heritage;

export const uiVars = {
  "--ui-green": h.green,
  "--ui-green-hover": h.greenHover,
  "--ui-green-deep": h.greenDeep,
  "--ui-sand": h.sand,
  "--ui-card": h.card,
  "--ui-border": h.border,
  "--ui-ink": h.ink,
  "--ui-ink-muted": h.inkMuted,
  "--ui-gold": h.gold,
  "--ui-kicker": h.goldKicker,
  "--ui-white": t.colors.white,
  "--ui-danger": t.colors.semantic.danger,
  "--ui-danger-bg": t.colors.semantic.dangerBg,
  "--ui-pill": t.radius.full,
  "--ui-radius-card": t.radius.card,
  "--ui-radius-md": t.radius.md,
  "--ui-shadow": t.shadows.sm,
  "--ui-ease": t.motion.ease,
} as CSSProperties;
