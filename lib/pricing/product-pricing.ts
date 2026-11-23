export const productCosts = [
  ["materials", "المواد الخام"],
  ["production", "التصنيع أو التجهيز"],
  ["packaging", "التغليف"],
  ["labor", "العمالة"],
  ["direct", "المصروفات المباشرة"],
  ["overhead", "نصيب الوحدة من مصروفات التشغيل"],
] as const;

export const fixedFees = [
  ["paymentFixed", "رسوم الدفع الثابتة لكل وحدة"],
  ["shipping", "الشحن أو الدفع عند الاستلام الذي تتحمله"],
  ["extraFees", "رسوم بيع إضافية ثابتة"],
] as const;

export const variableFees = [
  ["paymentRate", "رسوم الدفع الإلكتروني (%)"],
  ["commissionRate", "عمولة البيع (%)"],
] as const;

export const roundingOptions = ["none", "99", "90", "whole"] as const;
export const vatModes = ["none", "exclusive", "inclusive"] as const;

type MoneyKey = (typeof productCosts | typeof fixedFees)[number][0];
type RateKey = (typeof variableFees)[number][0] | "targetMargin" | "vatRate";

export type PricingInput = Record<MoneyKey | RateKey, string> & {
  rounding: (typeof roundingOptions)[number];
  vatMode: (typeof vatModes)[number];
  roundUp: boolean;
};

export const emptyPricing: PricingInput = {
  materials: "", production: "", packaging: "", labor: "", direct: "", overhead: "",
  paymentFixed: "", shipping: "", extraFees: "", paymentRate: "", commissionRate: "",
  targetMargin: "25", vatRate: "", vatMode: "none", rounding: "none", roundUp: false,
};

const scale = BigInt(10000);
const zero = BigInt(0);
const half = scale / BigInt(2);

export function decimalMinor(value: string, max = 100_000_000_000_000): bigint | null {
  if (!/^(?:\d{1,13}(?:\.\d{1,2})?|\.\d{1,2})$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const minor = BigInt(whole || "0") * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  return minor <= BigInt(max) ? minor : null;
}

export function formatMinor(value: bigint): string {
  const sign = value < zero ? "-" : "";
  const digits = (value < zero ? -value : value).toString().padStart(3, "0");
  return `${sign}${digits.slice(0, -2)}.${digits.slice(-2)}`;
}

const nearest = (n: bigint, d: bigint) => (n + d / BigInt(2)) / d;
const ceil = (n: bigint, d: bigint) => (n + d - BigInt(1)) / d;
const invalid = (error: string) => ({ error } as const);

export function withStoreVat(input: PricingInput, vatRate: string): PricingInput {
  return {
    ...input, vatRate,
    vatMode: vatRate === "0" ? "none" : input.vatMode === "inclusive" ? "inclusive" : "exclusive",
  };
}

export function calculatePricing(input: PricingInput, current: string, priceBasis: "display" | "beforeVat" = "display") {
  let productCost = zero;
  let fixed = zero;
  for (const [key, label] of [...productCosts, ...fixedFees]) {
    const value = decimalMinor(input[key] || "0", 100_000_000);
    if (value === null) return invalid(`أدخل قيمة من 0 إلى 1,000,000 بخانتين عشريتين كحد أقصى في «${label}».`);
    if (productCosts.some(([cost]) => cost === key)) productCost += value;
    else fixed += value;
  }
  const paymentRate = decimalMinor(input.paymentRate || "0", 10_000);
  const commissionRate = decimalMinor(input.commissionRate || "0", 10_000);
  const target = decimalMinor(input.targetMargin, 10_000);
  const vat = input.vatMode === "none" ? zero : decimalMinor(input.vatRate, 10_000);
  if (paymentRate === null || commissionRate === null || target === null || vat === null) {
    return invalid("أدخل نسبة صحيحة من 0 إلى 100 بخانتين عشريتين كحد أقصى.");
  }
  const rates = paymentRate + commissionRate;
  const denominator = scale - rates - target;
  if (denominator <= zero) return invalid("مجموع الرسوم المتغيرة وهامش الربح يجب أن يكون أقل من 100%.");
  const cost = productCost + fixed;
  const priceIncludesVat = priceBasis === "display" && input.vatMode === "inclusive";
  const fromNet = (net: bigint) => net + nearest(net * vat, scale);
  const metrics = (price: bigint) => {
    const net = priceIncludesVat ? nearest(price * scale, scale + vat) : price;
    const gross = priceIncludesVat ? price : fromNet(net);
    const variable = nearest(net * rates, scale);
    const profit = net - cost - variable;
    const ratio = profit * scale;
    const margin = net === zero ? null : ratio < zero ? -ceil(-ratio, net) : ratio / net;
    return { price, net, gross, tax: gross - net, fees: fixed + variable, profit, margin, belowTarget: net > zero && ratio < net * target };
  };

  const currentMinor = decimalMinor(current);
  const currentResult = currentMinor && currentMinor > zero ? metrics(currentMinor) : null;
  if (cost === zero) return { productCost, cost, current: currentResult, suggested: null, difference: null };

  const baseNet = nearest(cost * scale, denominator);
  const base = priceIncludesVat ? fromNet(baseNet) : baseNet;
  const ending = input.rounding === "99" ? BigInt(99) : input.rounding === "90" ? BigInt(90) : zero;
  const step = input.rounding === "none" ? BigInt(1) : BigInt(100);
  const roundPrice = (price: bigint, up: boolean) => {
    if (price <= ending) return ending;
    return ending + (up ? ceil(price - ending, step) : nearest(price - ending, step)) * step;
  };
  let price = roundPrice(base, input.roundUp);
  if (price === zero || (input.roundUp && metrics(price).belowTarget)) {
    // A rounded fee can exceed the exact fee by half a halala.
    const safeNet = ceil(cost * scale + half, denominator);
    price = roundPrice(priceIncludesVat ? fromNet(safeNet) : safeNet, true);
  }
  const suggested = metrics(price);
  return { productCost, cost, suggested, current: currentResult, difference: currentResult ? price - currentResult.price : null };
}

export function calculatePricingTiers(input: PricingInput) {
  const targetBasis = decimalMinor(input.targetMargin, 10_000);
  const paymentBasis = decimalMinor(input.paymentRate || "0", 10_000);
  const commissionBasis = decimalMinor(input.commissionRate || "0", 10_000);
  if (targetBasis === null || paymentBasis === null || commissionBasis === null) return [];
  const target = Number(targetBasis);
  const fees = Number(paymentBasis + commissionBasis);
  if (target + fees >= 10_000) return [];
  const margin = (points: number) => formatMinor(BigInt(points));
  const options = [
    { id: "economy", label: "اقتصادي", target: Math.max(0, target - 500) },
    { id: "balanced", label: "متوازن", target },
    { id: "premium", label: "مميز", target: Math.min(9999 - fees, target + 500) },
  ] as const;
  return options.flatMap(({ id, label, target }) => {
    const scenario = { ...input, targetMargin: margin(target) };
    const result = calculatePricing(scenario, "", "beforeVat");
    if ("error" in result || !result.suggested) return [];
    // A marketing rounding step can round a low-margin scenario to a loss.
    const adjusted = result.suggested.profit < BigInt(0)
      ? calculatePricing({ ...scenario, roundUp: true }, "", "beforeVat")
      : result;
    if ("error" in adjusted || !adjusted.suggested) return [];
    return [{ id, label, quote: adjusted.suggested }];
  });
}
