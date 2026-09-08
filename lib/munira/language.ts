// lib/munira/language.ts
// كشف اللغة التلقائي — بدون أي مفتاح API خارجي لهذه الوظيفة.
// هدف التصميم: منيرة ترد بنفس لغة المستخدم بدون أي تدخّل يدوي.

export type SupportedLanguage =
  | "ar"  // العربية (اللغة الأساسية)
  | "en"  // الإنجليزية
  | "ur"  // الأردية
  | "hi"  // الهندية
  | "bn"  // البنغالية
  | "tr"  // التركية
  | "fr"  // الفرنسية
  | "ms"  // الماليزية/الإندونيسية
  | "id"; // الإندونيسية

// أكثر اللغات المستخدمة في السوق السعودي، بترتيب الأولوية
export const PRIORITY_LANGUAGES: SupportedLanguage[] = ["ar", "en", "ur", "hi", "bn", "tr", "fr", "ms", "id"];

// نطاقات Unicode للكشف السريع بدون مكتبة خارجية
const SCRIPT_RANGES = {
  arabic:    /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/,
  latin:     /[a-zA-Z]/,
  devanagari:/[\u0900-\u097F]/,  // هندية
  bengali:   /[\u0980-\u09FF]/,
  urdu:      /[\u0600-\u06FF]/,  // Urdu يشارك Unicode العربي لكن بأحرف مختلفة
};

interface DetectedLanguage {
  primary: SupportedLanguage;
  isMixed: boolean;
  confidence: "high" | "medium" | "low";
  scripts: string[];
}

/**
 * يكشف اللغة من نص الرسالة بتحليل Unicode scripts بدون API خارجي.
 * للنصوص المختلطة (عربي+إنجليزي مثلاً) يُعيد اللغة الأغلب ويضع isMixed=true.
 */
export function detectLanguageFromText(text: string): DetectedLanguage {
  const scripts: string[] = [];
  let arabicChars = 0, latinChars = 0, devanagariChars = 0, bengaliChars = 0;

  for (const ch of text) {
    if (SCRIPT_RANGES.arabic.test(ch))     arabicChars++;
    if (SCRIPT_RANGES.latin.test(ch))      latinChars++;
    if (SCRIPT_RANGES.devanagari.test(ch)) devanagariChars++;
    if (SCRIPT_RANGES.bengali.test(ch))    bengaliChars++;
  }

  const total = arabicChars + latinChars + devanagariChars + bengaliChars;
  if (total === 0) return { primary: "ar", isMixed: false, confidence: "low", scripts: [] };

  const counts = { arabicChars, latinChars, devanagariChars, bengaliChars };
  const max = Math.max(...Object.values(counts));
  const isMixed = Object.values(counts).filter(c => c > 0 && c !== max).length > 0;

  if (arabicChars === max) {
    scripts.push("arabic");
    if (latinChars > 0) scripts.push("latin");
    // Urdu uses Arabic script — Arabic-script texts without diacritics and certain patterns
    // are likely Arabic from Saudi context, not Urdu. Claude handles disambiguation better.
    return { primary: "ar", isMixed, confidence: arabicChars > total * 0.6 ? "high" : "medium", scripts };
  }
  if (latinChars === max) {
    scripts.push("latin");
    if (arabicChars > 0) scripts.push("arabic");
    return { primary: "en", isMixed, confidence: latinChars > total * 0.7 ? "high" : "medium", scripts };
  }
  if (devanagariChars === max) {
    scripts.push("devanagari");
    return { primary: "hi", isMixed: false, confidence: "high", scripts };
  }
  if (bengaliChars === max) {
    scripts.push("bengali");
    return { primary: "bn", isMixed: false, confidence: "high", scripts };
  }

  return { primary: "ar", isMixed: false, confidence: "low", scripts: [] };
}

/**
 * يُحوّل Accept-Language header لأفضل لغة مدعومة.
 * مثال: "ar-SA,ar;q=0.9,en;q=0.8" → "ar"
 */
export function detectLanguageFromHeader(acceptLanguage: string | null): SupportedLanguage | null {
  if (!acceptLanguage) return null;
  const tags = acceptLanguage
    .split(",")
    .map(tag => tag.trim().split(";")[0].toLowerCase().slice(0, 2));
  for (const tag of tags) {
    if ((PRIORITY_LANGUAGES as string[]).includes(tag)) return tag as SupportedLanguage;
  }
  return null;
}

/** أسماء اللغات بالعربي والإنجليزي — للعرض في الواجهة */
export const LANGUAGE_NAMES: Record<SupportedLanguage, { ar: string; en: string; native: string }> = {
  ar: { ar: "العربية",     en: "Arabic",     native: "العربية" },
  en: { ar: "الإنجليزية", en: "English",     native: "English" },
  ur: { ar: "الأردية",    en: "Urdu",        native: "اردو" },
  hi: { ar: "الهندية",    en: "Hindi",       native: "हिंदी" },
  bn: { ar: "البنغالية",  en: "Bengali",     native: "বাংলা" },
  tr: { ar: "التركية",    en: "Turkish",     native: "Türkçe" },
  fr: { ar: "الفرنسية",   en: "French",      native: "Français" },
  ms: { ar: "الماليزية",  en: "Malay",       native: "Bahasa Melayu" },
  id: { ar: "الإندونيسية",en: "Indonesian",  native: "Bahasa Indonesia" },
};
