// theme/radius.ts
//
// نصف قطر الحواف الموحّد لمنصة بسطة.
// يُستخدم للبطاقات، الأزرار، الحقول، الحاويات والعناصر التفاعلية.
//
// الهدف:
// حواف ناعمة وحديثة مع الحفاظ على مظهر احترافي وغير مبالغ فيه.

export const radius = {
  none: "0px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "999px",
} as const;

export type Radius = typeof radius;