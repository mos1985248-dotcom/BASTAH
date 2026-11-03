// components/ui/css-vars.ts
// ألوان الهوية التراثية كمتغيرات CSS (تُضبط عبر uiVars في components/ui/vars.ts على الجذر).
// تُستعمل في الصفحات ذات الأنماط المضمّنة بدل t.colors.* القديمة، فتتبع الهوية دون كتابة أي hex.
export const ui = {
  green: "var(--ui-green)",
  greenHover: "var(--ui-green-hover)",
  greenDeep: "var(--ui-green-deep)",
  sand: "var(--ui-sand)",
  card: "var(--ui-card)",
  border: "var(--ui-border)",
  ink: "var(--ui-ink)",
  inkMuted: "var(--ui-ink-muted)",
  gold: "var(--ui-gold)",
  kicker: "var(--ui-kicker)",
  white: "var(--ui-white)",
  danger: "var(--ui-danger)",
  dangerBg: "var(--ui-danger-bg)",
} as const;
