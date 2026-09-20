// theme/index.ts
//
// نقطة الدخول المركزية لنظام التصميم في منصة بسطة.
//
// الاستخدام:
// import { t } from "@/theme";
// ثم:
// t.colors.primary[800]
// t.typography.fontSize.lg
// t.spacing[4]
//
// يحتوي Theme على:
// الألوان، الخطوط، المسافات، الحواف، الظلال، الحركة، وتخطيط الصفحة.

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { motion } from "./motion";
import { layout } from "./layout";

export const t = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  motion,
  layout,
} as const;

export type Theme = typeof t;

export { colors } from "./colors";
export {
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
} from "./typography";
export { spacing } from "./spacing";
export { radius } from "./radius";
export { shadows } from "./shadows";
export { motion } from "./motion";
export { layout } from "./layout";