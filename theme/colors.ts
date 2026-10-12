
export const colors = {
  // Primary — الأخضر الزمردي لهوية بسطة
  primary: {
    950: "#0C3528",
    900: "#104735",
    800: "#13563F",
    700: "#155F49",
    600: "#176B52",
    500: "#2F8067",
    400: "#5B9B84",
    300: "#8DBBA9",
    200: "#B9D9CC",
    100: "#DDEFE7",
    50: "#F1F8F4",
  },

  // Gold — الذهبي الحالي
  gold: {
    700: "#A87C2A",
    600: "#C9973A",
    500: "#D2A34A",
    400: "#DDB35F",
    300: "#E7C985",
    200: "#EFDCB0",
    100: "#F7F3EA",
    50: "#FBF8F1",
  },

  // Cream — الخلفيات والمحايد الدافئ
  cream: {
    bg: "#FAFAF7",
    card: "#FFFFFF",
    warm: "#F7F3EA",
    border: "#EADFCF",
    borderLight: "#F2ECE1",
  },

  // Text — النصوص
  text: {
    dark: "#111827",
    body: "#374151",
    mid: "#4B5563",
    light: "#9CA3AF",
    onDark: "#FFFFFF",
    onDarkMuted: "#D1D5DB",
  },

  // Semantic — الحالات والتنبيهات
  semantic: {
    success: "#16A34A",
    successBg: "#E9F7EF",
    warning: "#D97706",
    warningBg: "#FDF3E3",
    info: "#2563EB",
    infoBg: "#EAF1FE",
    danger: "#DC2626",
    dangerBg: "#FCEBEB",
  },

  // Neutral
  white: "#FFFFFF",
  black: "#000000",

  // External Brands
  brand: {
    whatsapp: "#25D366",
  },
} as const;

export type ThemeColors = typeof colors;
