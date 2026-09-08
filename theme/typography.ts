// theme/typography.ts
// الخط الوحيد المسموح في كامل المنصة: IBM Plex Sans Arabic.
// يُحمَّل عبر next/font/google في app/layout.tsx ويُربط بمتغيّر CSS var(--font-plex-arabic).

export const fontFamily = {
  base: "var(--font-plex-arabic), 'IBM Plex Sans Arabic', system-ui, sans-serif",
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// سلّم أحجام واضح لكل الاستخدامات (px) - تم تكبيره قليلاً لنمط سلة الفاخر
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