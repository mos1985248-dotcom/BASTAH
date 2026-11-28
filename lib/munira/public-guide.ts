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

const stop = new Set("من في على عن هل كيف ما هي هو انا ابغي ابغى اريد عايز ابي بسطة بسطه مارت الله لو سمحت ايش وش".split(" "));
const words = (text: string) => normalizeArabic(text).split(" ").filter(x => x.length > 2 && !stop.has(x))
  .map(x => x.replace(/^ال(?=.{3})/u, ""));

export function helpArticle(input: string) {
  const normalized = normalizeArabic(input);
  const tokens = words(input);
  const items = faqGroups.flatMap(group => group.items);
  if (/^(?:(?:ايش|وش|ما|ما هي) )?(?:الباقات|باقات بسطة|اسعار الباقات)$/u.test(normalized)) {
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
