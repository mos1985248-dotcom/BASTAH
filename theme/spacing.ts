// theme/spacing.ts
// سلّم مسافات موحّد (padding, margin, gap) — لا قيم مباشرة في المكونات.
// تم توسيع الفراغات والمساحات قليلاً لتوفير راحة بصرية وتجربة شبيهة بسلة

export const spacing = {
  "0": "0px",
  "1": "6px",
  "2": "10px",
  "3": "14px",
  "4": "18px",
  "5": "24px",
  "6": "32px",
  "8": "44px",
  "10": "56px",
  "12": "72px",
  "16": "96px",
  "20": "120px",
  "24": "144px",
} as const;

export type Spacing = typeof spacing;