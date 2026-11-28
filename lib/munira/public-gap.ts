import { normalizeArabic } from "./public-guide";
// Conservative opt-in allowlist: reject identifiers, free-form complaints and personal account questions.
// No raw conversation, IP, user ID or contact details are retained.
export function safeGapQuestion(message: string) {
  if (message.length > 140 || /[^\p{Script=Arabic}\p{M}\s؟،.?!]/u.test(message) || /\p{N}/u.test(message)) return null;
  const key = normalizeArabic(message);
  if (!/^(?:هل|كيف|ما|ماهي|ماهو|وش|ايش|شنو|كم|متي|اين|وين) /u.test(key)) return null;
  if (!/(?:بسطه مارت|الباقات|باقه|الاشتراك|العموله|دفاتري|منيره|التسجيل|التسويق|الشحن|التوصيل|الدفع|الاسترجاع)/u.test(key)) return null;
  if (/(?:اسمي|اسمه|اسمها|عنوان|جوال|بريد|حسابي|طلبي|شحنني|شحنتي|بطاق|هويه|كلمه|رمز|رقم|شكوي|مشكل|محجوب|عميل|فلان|ساكن)/u.test(key)) return null;
  return { questionKey: key, question: key };
}
