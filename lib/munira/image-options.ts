export const imageKinds = {
  product: "صورة تسويقية لمنتج",
  background: "خلفية تسويقية",
  social: "منشور للتواصل الاجتماعي",
  cover: "غلاف متجر",
  advertisement: "تصميم إعلاني",
  custom: "وصف مخصص",
} as const;

export const imageSizes = {
  square: { label: "مربع 768 × 768", width: 768, height: 768 },
  portrait: { label: "عمودي 640 × 800", width: 640, height: 800 },
  landscape: { label: "أفقي 896 × 512", width: 896, height: 512 },
} as const;

export const fluxModel = "@cf/black-forest-labs/flux-1-schnell";
