// theme/motion.ts
//
// نظام الحركة والانتقالات الموحّد لمنصة بسطة.
//
// الهدف:
// انتقالات هادئة وسلسة تعطي الواجهة إحساسًا حديثًا واحترافيًا
// دون مبالغة في الحركة.
//
// يُفضّل استخدام الحركة على الخصائص البصرية المحددة
// مثل transform وopacity وbox-shadow وbackground وborder-color
// بدل استخدام transition: all في جميع الحالات.

export const motion = {
  fast: "200ms",
  base: "250ms",
  slow: "350ms",
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export type Motion = typeof motion;