import { faqGroups } from "@/components/faq/faq-data";

const cityAliases = new Map([
  ["حايل", "حائل"], ["الرياض", "الرياض"], ["جده", "جدة"], ["مكه", "مكة"],
  ["المدينه", "المدينة المنورة"], ["المدينه المنوره", "المدينة المنورة"],
  ["الدمام", "الدمام"], ["ابها", "أبها"], ["بريده", "بريدة"], ["الطايف", "الطائف"],
  ["تبوك", "تبوك"], ["القصيم", "القصيم"], ["الخبر", "الخبر"],
]);

export function normalizeArabic(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/[\u064B-\u065F\u0670ـ]/g, "")
    .replace(/[أإآ]/g, "ا").replace(/ئ/g, "ي").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

export function storeSearch(text: string, marketCities: string[], previousProduct?: string) {
  const input = normalizeArabic(text);
  const sale = /(?:^| )(?:تبيع لي|تبيع|يبيع|تبيعون|عندها|عنده|توفر|يوفر|للبيع) (.+)$/u.exec(input);
  const itemBeforeLocation = /(?:^| )(?:ابغ[اي]|اريد|ابي|عايز|عاوزه|ادور على|ابحث عن|فين الاقي|وين الاقي|وين القي|فين القي) (.+?) (?:في|من|بمدينة|مدينه) (.+)$/u.exec(input);
  const followUp = previousProduct && /^(?:(?:طيب|وطيب|وماذا عن) )?(?:في|من|بمدينه) (.{2,50})$/u.exec(input);
  if (!sale && !itemBeforeLocation && !followUp) return null;
  const location = sale ? /(?:^| )(?:في|من|بمدينه|مدينه) (.+)$/u.exec(input.slice(0, sale.index))?.[1] : itemBeforeLocation?.[2];
  const tailLocation = sale ? /^(.*?) (?:في|من|بمدينه|مدينه) (.+)$/u.exec(sale[1]) : null;
  const place = (location ?? tailLocation?.[2] ?? (followUp ? followUp[1] : undefined))?.replace(/ (?:بسطه|متجر)$/u, "");
  const product = (tailLocation?.[1] ?? sale?.[1] ?? itemBeforeLocation?.[1] ?? (followUp ? previousProduct : "") ?? "")
    .replace(/^(?:منتج|منتجات) /u, "").slice(0, 80).trim();
  if (product.length < 2) return null;
  const city = place ? cityAliases.get(place) ?? marketCities.find(name => normalizeArabic(name) === place) ?? place : null;
  const matchingCities = city ? [...new Set([city, ...marketCities.filter(name => normalizeArabic(name) === normalizeArabic(city))])] : [];
  return { product, city, matchingCities };
}

export const publicKnowledge = faqGroups.flatMap(group => group.items);

// Explicit aliases resolve common dialect and spelling variants without an AI call.
const aliases: [string, string[]][] = [
  ["ما هي بسطة مارت؟", ["ماهي بسطة مارت", "وش بسطة مارت", "ايش بسطة مارت", "شنو بسطة مارت", "يعني ايه بسطة مارت", "عرفيني على بسطة مارت", "عرفني على بسطة مارت", "ما هو موقع بسطة مارت", "عن بسطة مارت", "بسطة مارت", "وش فكرة بسطة مارت"]],
  ["كيف أفتح بسطتي؟", ["كيف افتح بسطة", "ابي افتح بسطة", "ابغى افتح متجر", "كيف اسجل كبائع", "كيف اصير تاجر"]],
  ["هل أستطيع البدء مجانًا؟", ["هل التسجيل مجاني", "هل اقدر ابدا مجانا", "فيه باقة مجانية", "هل فتح البسطة مجاني"]],
  ["كيف أعرف أسعار الباقات ومزاياها؟", ["كم الاشتراك", "كم سعر الاشتراك", "كم اسعار الباقات", "وش الباقات", "ماهي الباقات", "باقات بسطة مارت"]],
  ["هل تأخذ بسطة مارت عمولة على المبيعات؟", ["هل تاخذون عمولة", "كم عمولتكم", "فيه عمولة على البيع", "كم نسبة بسطة مارت من المبيعات"]],
  ["ما طرق الدفع المتاحة؟", ["كيف ادفع", "وش طرق الدفع", "كيف الدفع", "ايش وسائل الدفع"]],
  ["كيف أتتبع الشحنة؟", ["وين شحنتي", "كيف اتتبع شحنتي", "كيف اتتبع الشحنة"]],
  ["كيف أتابع طلبي؟", ["وين طلبي", "كيف اتابع الطلب", "كيف اعرف حالة طلبي"]],
  ["كيف تُحسب تكلفة الشحن؟", ["كم الشحن", "كم سعر التوصيل", "كم تكلفة الشحن"]],
  ["كيف أحصل على المساعدة؟", ["ابي الدعم", "ابغى اكلم الدعم", "كيف اتواصل مع الدعم", "كيف اكلم خدمة العملاء"]],
  ["ما هي منيرة ودفاتري؟", ["وش دفاتري", "ماهي دفاتري", "وش منيرة", "ماهي منيرة", "ايش منيرة ودفاتري"]],
  ["نسيت كلمة المرور، ماذا أفعل؟", ["نسيت كلمة السر", "نسيت كلمة المرور", "كيف استرجع كلمة المرور"]],
  ["هل أستطيع إرجاع المنتج؟", ["كيف ارجع المنتج", "هل اقدر ارجع المنتج", "وش سياسة الاسترجاع"]],
];
const aliasIndex = new Map(aliases.flatMap(([question, phrases]) => phrases.map(phrase => [normalizeArabic(phrase), question] as const)));

// AI may select a published answer, never invent a policy or external link.
export function selectKnowledgeAnswer(output: string, items = publicKnowledge) {
  const match = /^\s*(?:FAQ:)?(\d{1,3})\s*$/u.exec(output);
  if (!match) return null;
  const index = Number(match[1]);
  return index > 0 ? items[index - 1] ?? null : null;
}

export function knowledgeChoices(items = publicKnowledge) {
  return items.map((item, i) => `${i + 1}. ${item.question}`).join("\n");
}

const stop = new Set("من في على عن هل كيف ما هي هو انا ابغي ابغى اريد عايز ابي بسطة بسطه مارت الله لو سمحت ايش وش".split(" "));
const words = (text: string) => normalizeArabic(text).split(" ").filter(x => x.length > 2 && !stop.has(x))
  .map(x => x.replace(/^ال(?=.{3})/u, ""));

export function helpArticle(input: string, items = publicKnowledge) {
  const normalized = normalizeArabic(input);
  const tokens = words(input);
  const alias = aliasIndex.get(normalized);
  if (alias) return items.find(item => item.question === alias) ?? null;
  if (/^(?:(?:ايش|وش|ما|ما هي) )?(?:الباقات|باقات بسطه|اسعار الباقات)$/u.test(normalized)) {
    return items.find(item => item.linkLabel === "مقارنة الباقات") ?? null;
  }
  const exact = items.find(item => normalizeArabic(item.question) === normalized);
  if (exact) return exact;
  const scores = items.map(item => {
    const question = words(item.question);
    return { item, score: new Set(tokens.filter(word => question.includes(word))).size };
  }).sort((a, b) => b.score - a.score);
  return (scores[0]?.score ?? 0) >= 2 && scores[0].score > (scores[1]?.score ?? 0) ? scores[0].item : null;
}

export const merchantStart = /(?:افتح|فتح|انشاء|ابدا|اسوي|اعمل|ابد[اي]|اسجل).{0,28}(?:متجر|بسطه)|(?:متجر|بسطه).{0,16}(?:جديد|البيع)/u;
