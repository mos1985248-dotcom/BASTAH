import assert from "node:assert/strict";
import { test } from "node:test";
import { planIntent, formatPlanAnswer, type PublicPlan } from "../../lib/munira/public-plans";
test("plan follow-ups use bounded context, not arbitrary visitor history", () => {
  assert.deepEqual(planIntent("كم الاشتراك؟"), { codes: [], yearly: false });
  assert.deepEqual(planIntent("باقة نمو"), { codes: ["STARTER"], yearly: false });
  assert.deepEqual(planIntent("كم سعرها سنوياً؟", { topic: "plans", plan: "STARTER" }), { codes: ["STARTER"], yearly: true });
  assert.equal(planIntent("كم سعرها؟"), null);
  assert.equal(planIntent("وين طلبي؟", { topic: "plans", plan: "STARTER" }), null);
});
test("prices and product limits are read from the supplied active plans", () => {
  const plans: PublicPlan[] = [{ plan: "STARTER", nameAr: "نمو", priceMonthly: 49, priceYearly: 470, currency: "SAR", maxProducts: 20, featuresAr: ["دفاتري"] }];
  const result = formatPlanAnswer(plans, { codes: ["STARTER"], yearly: false });
  assert.ok(result.text.includes("20"));
  assert.ok(result.text.includes("دفاتري"));
  assert.deepEqual(result.context, { topic: "plans", plan: "STARTER" });
  assert.deepEqual(formatPlanAnswer(plans, { codes: ["PRO"], yearly: false }).context, { topic: "plans" });
});
