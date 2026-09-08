// theme/motion.ts
// انتقالات خفيفة وموحّدة — نفس المدة والمنحنى بكل مكان بدل قيم عشوائية
// متفرّقة بكل ملف. تُستخدم مع transition: `all ${t.motion.fast} ${t.motion.ease}`.
// تم صقل الانتقالات لتصبح أبطأ وأكثر نعومة وفخامة (نمط سلة الاحترافي)

export const motion = {
  fast: "200ms",
  base: "250ms",
  slow: "350ms",
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export type Motion = typeof motion;