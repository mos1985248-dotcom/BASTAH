import assert from "node:assert/strict";
import { test } from "node:test";
import { imageFeedback, imageInput } from "../../lib/munira/image-studio";
import { productImageTemplates } from "../../lib/munira/image-templates";
import { randomUUID } from "node:crypto";

test("ready-made prompts meet image input limits and have distinct categories", () => {
  assert.equal(new Set(productImageTemplates.map(template => template.id)).size, productImageTemplates.length);
  for (const template of productImageTemplates) {
    assert.equal(imageInput.safeParse({ requestId: randomUUID(), kind: "product", size: "square", prompt: template.prompt }).success, true);
  }
});

test("a correction requires a reason, while positive feedback is optional", () => {
  assert.equal(imageFeedback.safeParse({ status: "NEEDS_EDIT", note: "  " }).success, false);
  assert.equal(imageFeedback.safeParse({ status: "NEEDS_EDIT", note: "خفّف الظل" }).success, true);
  assert.equal(imageFeedback.safeParse({ status: "MATCHED" }).success, true);
  assert.equal(imageFeedback.safeParse({ status: "MATCHED", note: "x".repeat(241) }).success, false);
});
