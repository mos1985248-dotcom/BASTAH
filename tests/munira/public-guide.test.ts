import assert from "node:assert/strict";
import { test } from "node:test";
import { helpArticle, merchantStart, normalizeArabic, storeSearch } from "../../lib/munira/public-guide";

test("interprets Saudi and other Arabic phrasing for a product and city", () => {
  assert.deepEqual(storeSearch("عايز بسطة فى حائل تبيع تمر", ["حائل", "حايل", "الرياض"]), {
    product: "تمر", city: "حائل", matchingCities: ["حائل", "حايل"],
  });
  assert.equal(storeSearch("أبغى عسل في جدة", ["جدة"])?.city, "جدة");
  assert.equal(storeSearch("أبغى بسطة تبيع قهوة", [])?.city, null);
});

test("keeps platform answers grounded in published FAQs and recognizes seller onboarding", () => {
  assert.equal(storeSearch("كيف أبدأ متجري؟", []), null);
  assert.equal(merchantStart.test(normalizeArabic("كيف أبدأ متجري؟")), true);
  assert.equal(helpArticle("هل يمكن تصفح السوق دون حساب؟")?.href, "/marketplace");
  assert.equal(helpArticle("وش الباقات؟")?.href, "/pricing");
  assert.equal(helpArticle("كم أرباح التاجر في الرياض؟"), null);
});
