// theme/shadows.ts
// ظلال موحّدة — دافئة قليلاً (لا رمادي بارد بحت) لتماشي الهوية الكريمية.
// تم تفعيل نعومة الظلال لتتناسب مع نمط سلة الراقي والبطاقات العائمة

export const shadows = {
  none: "none",
  xs: "0 1px 3px rgba(27, 77, 62, 0.05)",
  sm: "0 4px 10px rgba(27, 77, 62, 0.07)",
  md: "0 8px 20px rgba(27, 77, 62, 0.09)",
  lg: "0 16px 40px rgba(27, 77, 62, 0.12)",
  gold: "0 6px 18px rgba(201, 151, 58, 0.22)",
} as const;

export type Shadows = typeof shadows;