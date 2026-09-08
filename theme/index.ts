// theme/index.ts
// المصدر الوحيد لكل الألوان/الخطوط/المسافات في المنصة.
// الاستخدام في أي مكون: import { t } from "@/theme";  ثم t.colors.primary[800] إلخ.
// ممنوع أي قيمة hardcoded (لون / حجم خط / مسافة) خارج مجلد theme/.

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { motion } from "./motion";

export const t = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  motion,
} as const;

export type Theme = typeof t;

export { colors } from "./colors";
export { typography, fontFamily, fontWeight, fontSize, lineHeight } from "./typography";
export { spacing } from "./spacing";
export { radius } from "./radius";
export { shadows } from "./shadows";
export { motion } from "./motion";
