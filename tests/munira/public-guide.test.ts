import assert from "node:assert/strict";
import { test } from "node:test";
import { helpArticle, merchantStart, normalizeArabic, storeSearch, selectKnowledgeAnswer, publicKnowledge } from "../../lib/munira/public-guide";

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

test("uses the previous product for a city follow-up and resets for a new product", () => {
  assert.deepEqual(storeSearch("طيب في بريدة؟", ["بريدة"], "تمر"), {
    product: "تمر", city: "بريدة", matchingCities: ["بريدة"],
  });
  assert.equal(storeSearch("طيب في بريدة؟", ["بريدة"]), null);
  assert.equal(storeSearch("أبغى بسطة في حائل تبيع هيل", ["حائل"], "تمر")?.product, "هيل");
});


test("recognizes platform identity and common dialect variants without AI", () => {
  for (const phrase of ["ماهي بسطة مارت", "ما هي بسطة مارت؟", "وش بسطة مارت", "شنو بسطة مارت", "عرفيني على بسطة مارت"]) {
    assert.equal(helpArticle(phrase)?.question, "ما هي بسطة مارت؟");
  }
  assert.equal(helpArticle("كم الاشتراك")?.href, "/pricing");
  assert.equal(helpArticle("نسيت كلمة السر")?.href, "/reset-password");
  assert.equal(helpArticle("وين طلبي")?.question, "كيف أتابع طلبي؟");
  assert.equal(helpArticle("كم أرباح التاجر في الرياض؟"), null);
});

test("model selection can only return a published FAQ, not generated facts", () => {
  assert.equal(selectKnowledgeAnswer("1"), publicKnowledge[0]);
  assert.equal(selectKnowledgeAnswer("FAQ:1"), publicKnowledge[0]);
  for (const invalid of ["0", "999", "1 and 2", "https://example.com", "invented answer"]) assert.equal(selectKnowledgeAnswer(invalid), null);
});
