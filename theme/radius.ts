// theme/radius.ts
// نصف قطر الحواف الموحّد لكل المكونات (بطاقات، أزرار، حقول إدخال).
// تم ضبط الانحناءات لتكون أنعم وأكثر عصرية بما يتماشى مع واجهات سلة المتميزة

export const radius = {
  none: "0px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "999px",
} as const;

export type Radius = typeof radius;