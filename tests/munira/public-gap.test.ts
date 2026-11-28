import assert from "node:assert/strict";
import { test } from "node:test";
import { safeGapQuestion } from "../../lib/munira/public-gap";
test("only eligible general questions are retained", () => {
  assert.ok(safeGapQuestion("كيف أستفيد من التسويق في بسطة مارت؟"));
  for (const question of ["كيف أتواصل بخصوص طلبي في بسطة مارت؟", "كيف أغير بريدي في بسطة مارت؟", "كيف أشترك في بسطة مارت 0501234567", "كيف أسجل في بسطة مارت test@example.com", "كيف أرسل رقم هويتي في بسطة مارت؟", "كيف أشتري منتجًا؟"]) assert.equal(safeGapQuestion(question), null);
});
