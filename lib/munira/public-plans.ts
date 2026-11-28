import { normalizeArabic } from "./public-guide";
export const planCodes = ["FREE", "STARTER", "GROWTH", "PRO"] as const;
export type PlanCode = typeof planCodes[number];
export type PlanContext = { topic: "plans"; plan?: PlanCode };
export type PublicPlan = {
  plan: PlanCode; nameAr: string; priceMonthly: number; priceYearly: number; currency: string;
  maxProducts: number | null; featuresAr: string[];
};
const aliases: Record<PlanCode, string[]> = {
  FREE: ["بداية", "البداية", "المجانية"],
  STARTER: ["نمو", "النمو"],
  GROWTH: ["انطلاق", "الانطلاق"],
  PRO: ["ازدهار", "الازدهار"],
};
const contains = (text: string, word: string) => (" " + text + " ").includes(" " + normalizeArabic(word) + " ");
export function planIntent(message: string, previous?: PlanContext) {
  const text = normalizeArabic(message);
  const explicit = /(?:^| )(?:باقه|باقات|الباقه|الباقات|اشتراك|الاشتراك|الاشتراكات)(?: |$)/u.test(text) && !/الغاء|الغي|استرداد|ترقيه|تغيير|اجدد|تجديد|مشكل|خصم المبلغ|دفعت/u.test(text);
  const follow = /^(?:(?:طيب|وطيب|و|طب) ?)?(?:كم (?:سعرها|سعره|سعرها سنويا|منتج|منتجات)|كم (?:السعر|العدد)|وش (?:مزاياها|فيها)|ايش مزاياها|مميزاتها|مزاياها|سعرها|والسنوي|والشهري|سنويا|شهريا|كم سنويا|كم شهريا|كم سعرها بالسنه|كم سعرها بالشهر)$/u.test(text);
  const named = planCodes.filter(code => aliases[code].some(name => contains(text, name)));
  const shortName = named.length === 1 && aliases[named[0]].some(name => [normalizeArabic(name), "طيب " + normalizeArabic(name), "و" + normalizeArabic(name)].includes(text));
  if (!explicit && !(previous && (follow || shortName))) return null;
  return { codes: named.length ? named : !explicit && previous?.plan ? [previous.plan] : [], yearly: /سنوي|سنه/u.test(text) };
}
export function formatPlanAnswer(plans: PublicPlan[], intent: NonNullable<ReturnType<typeof planIntent>>) {
  const selected = intent.codes.length ? plans.filter(plan => intent.codes.includes(plan.plan)) : plans;
  const links = [{ href: "/pricing", label: "الباقات والأسعار" }];
  if (!selected.length) return { text: "ما قدرت أتحقق من الباقة المطلوبة الآن. راجع صفحة الباقات المتاحة.", links, context: { topic: "plans" as const } };
  const format = (value: number, currency: string) => new Intl.NumberFormat("ar-SA", { style: "currency", currency }).format(value);
  const lines = selected.map(p => {
    const price = intent.yearly ? p.priceYearly : p.priceMonthly;
    const features = selected.length === 1 && p.featuresAr.length ? "\n" + p.featuresAr.slice(0, 8).join("، ") : "";
    return p.nameAr + ": " + format(price, p.currency) + (intent.yearly ? " سنويًا" : " شهريًا") +
      " — " + (p.maxProducts === null ? "منتجات غير محدودة" : p.maxProducts + " منتجات") + features;
  });
  return { text: "هذي الباقات المتاحة حاليًا:\n" + lines.join("\n") + "\nراجع تفاصيل المزايا وشروط الاشتراك قبل الاختيار.", links,
    context: { topic: "plans" as const, ...(selected.length === 1 ? { plan: selected[0].plan } : {}) } };
}
