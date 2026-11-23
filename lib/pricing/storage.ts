import { z } from "zod";
import { calculatePricing, roundingOptions, vatModes, type PricingInput } from "./product-pricing";

const amount = z.string().max(16).regex(/^\d{0,13}(?:\.\d{1,2})?$/);
const inputSchema = z.object({
  materials: amount, production: amount, packaging: amount, labor: amount, direct: amount, overhead: amount,
  paymentFixed: amount, shipping: amount, extraFees: amount, paymentRate: amount, commissionRate: amount,
  targetMargin: amount, vatRate: amount, vatMode: z.enum(vatModes), rounding: z.enum(roundingOptions), roundUp: z.boolean(),
}).strict();

export const productPricingSchema = inputSchema.superRefine((input, ctx) => {
  const result = calculatePricing(input, "");
  if ("error" in result) ctx.addIssue({ code: "custom", message: result.error });
});

export function pricingRecord(input: PricingInput) {
  const result = calculatePricing(input, "");
  if ("error" in result) throw new Error(result.error);
  return { inputs: input, productCostMinor: Number(result.productCost), unitCostMinor: Number(result.cost) };
}

export function readPricingInputs(value: unknown): PricingInput {
  return productPricingSchema.parse(value);
}
