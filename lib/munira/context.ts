import type { SupportedLanguage } from "./language";
import { calculatePricing, calculatePricingTiers, emptyPricing, formatMinor } from "@/lib/pricing/product-pricing";

export function redactPrompt(text: string) {
  return text
    .replace(/\b(?:sk-[\w-]{12,}|gsk_[\w-]{12,}|AIza[\w-]{20,}|eyJ[\w-]+\.[\w-]+\.[\w-]+)\b/g, "[محجوب]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[بريد محجوب]")
    .replace(/\bSA\d{22}\b/gi, "[آيبان محجوب]")
    .replace(/(?<!\d)(?:\+?\d[\s-]?){10,19}(?!\d)/g, "[رقم محجوب]");
}

export function muniraPrompt(language: SupportedLanguage, role: string, older: string[]) {
  const context = older.slice(0, 3).reverse().map(text => redactPrompt(text).replace(/\s+/g, " ").slice(0, 110)).join("\n");
  return [
    `أنتِ منيرة، مساعدة بسطة مارت للتجار والمتسوقين. لغة الجواب: ${language}. نوع المستخدم: ${role}.`,
    "اكتبي جوابًا موجزًا وعمليًا عن المنصة والتسوق وإدارة المتجر. لا تدّعي قراءة بيانات أو تنفيذ إجراءات.",
    "وجّهي طلبات حساب الربح والسعر إلى حاسبة تسعير المنتج. لا تخمّني الأرقام ولا تكشفي معلومات خاصة.",
    context && `سياق مختصر من أسئلة سابقة، للاسترشاد فقط: ${JSON.stringify(context)}`,
  ].filter(Boolean).join("\n");
}


export function localPricingAnswer(text: string): string | null {
  const input = text.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632)).replace(/٫/g, ".");
  const match = input.match(/^تسعير\s+تكلفة\s+(\d+(?:\.\d{1,2})?)\s+هامش\s+(\d+(?:\.\d{1,2})?)(?:\s+رسوم\s+(\d+(?:\.\d{1,2})?))?\s*$/);
  if (match) {
    const [, materials, targetMargin, paymentRate = "0"] = match;
    const pricing = { ...emptyPricing, materials, targetMargin, paymentRate };
    const result = calculatePricing(pricing, "", "beforeVat");
    if ("error" in result) return result.error;
    const tiers = calculatePricingTiers(pricing);
    if (tiers.length) return ["خيارات التسعير قبل الضريبة:", ...tiers.map(({ label, quote }) =>
      `• ${label}: ${formatMinor(quote.net)} ر.س. ربح الوحدة المتوقع: ${formatMinor(quote.profit)} ر.س.`
    )].join("\n");
  }
  if (/^(?:تسعير|احسب (?:لي )?(?:السعر|سعر|الربح|الهامش)|calculate (?:price|profit|margin))(?:\s|$)/i.test(input) || input.startsWith("تسعير")) {
    return "للحساب داخل منيرة اكتب مثلًا: تسعير تكلفة 45 هامش 25 رسوم 2. للتكاليف التفصيلية استخدم حاسبة تسعير المنتج في لوحة التاجر.";
  }
  return null;
}
