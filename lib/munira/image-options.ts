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

export const imagePresets = {
  product: {
    label: "صورة منتج", width: 1200, height: 1200, aspectRatio: "1:1",
    composition: "Center the product, keep it fully visible, and use a clean, uncluttered background.",
  },
  store_logo: {
    label: "شعار المتجر", width: 1024, height: 1024, aspectRatio: "1:1",
    composition: "Use a centered, balanced logo composition with generous clear space on all sides and a simple background. Prioritize a distinct, readable silhouette.",
  },
  store_cover: {
    label: "غلاف المتجر", width: 1800, height: 600, aspectRatio: "16:9",
    composition: "Design an ultra-wide 3:1 banner. Keep all key elements inside the central horizontal band and reserve generous uncluttered negative space on one side for text to be overlaid later. Do not render the text.",
  },
  square_ad: {
    label: "إعلان مربع", width: 1080, height: 1080, aspectRatio: "1:1",
    composition: "Compose for a square social ad with a distinct focal point and clear margins.",
  },
  story_ad: {
    label: "إعلان قصة", width: 1080, height: 1920, aspectRatio: "9:16",
    composition: "Compose a vertical 9:16 story ad, with the focal point in the central area and room at the top and bottom for interface overlays.",
  },
} as const;

export type ImagePreset = keyof typeof imagePresets;
export type LegacyImageSize = keyof typeof imageSizes;
export type ImageSize = LegacyImageSize | ImagePreset;

export function isImagePreset(key: string): key is ImagePreset {
  return Object.prototype.hasOwnProperty.call(imagePresets, key);
}

export function outputSize(kind: string, size: LegacyImageSize): ImageSize {
  return isImagePreset(kind) ? kind : size;
}
