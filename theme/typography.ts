// theme/typography.ts

// نظام الخطوط المركزي لمنصة بسطة:
// - IBM Plex Sans Arabic للنصوص والأزرار والمحتوى العام.
// - Noto Kufi Arabic للعناوين الرئيسية لإضافة لمسة عربية تراثية حديثة.

export const fontFamily = {
  base: "var(--font-plex-arabic), 'IBM Plex Sans Arabic', system-ui, sans-serif",
  heading: "var(--font-kufi-arabic), 'Noto Kufi Arabic', system-ui, sans-serif",
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const fontSize = {
  xs: "13px",
  sm: "14px",
  base: "16px",
  md: "17px",
  lg: "19px",
  xl: "22px",
  "2xl": "26px",
  "3xl": "32px",
  "4xl": "40px",
  "5xl": "48px",
} as const;

export const lineHeight = {
  tight: 1.25,
  snug: 1.4,
  normal: 1.6,
  relaxed: 1.8,
} as const;

export const typography = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
} as const;

export type Typography = typeof typography;