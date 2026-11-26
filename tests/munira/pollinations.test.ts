import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { imageProviders, pollinationsImageUrl } from "../../lib/munira/image-provider";

test("Pollinations encodes the prompt and uses unique cache-busting seeds", () => {
  const prompt = "Dates & coffee / تجريبي";
  const url = new URL(pollinationsImageUrl(prompt, 123));
  assert.equal(url.hostname, "image.pollinations.ai");
  assert.equal(decodeURIComponent(url.pathname.slice("/prompt/".length)), prompt);
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    model: "flux", width: "1024", height: "1024", nologo: "true", seed: "123",
  });
  const seeds = Array.from({ length: 8 }, () => new URL(pollinationsImageUrl(prompt)).searchParams.get("seed"));
  assert.ok(new Set(seeds).size > 1);
});

test("Pollinations accepts valid binary images and stops at a payment or rate limit", async t => {
  const jpeg = await sharp({ create: { width: 8, height: 8, channels: 3, background: "white" } }).jpeg().toBuffer();
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let calls = 0;
  globalThis.fetch = async (_, init) => {
    calls++;
    assert.equal(init?.method, "GET");
    assert.equal(new Headers(init?.headers).has("Authorization"), false);
    assert.equal(init?.redirect, "error");
    if (calls === 1) return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg" } });
    if (calls === 2) return Response.json({}, { status: 402 });
    return Response.json({});
  };
  const result = await imageProviders.pollinations.generate("flux", "Dates", "square");
  const metadata = await sharp(result.buffer).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1024);
  assert.equal(result.estimatedNeurons, 0);
  await assert.rejects(imageProviders.pollinations.generate("flux", "Dates", "square"), /HTTP_429/);
  await assert.rejects(imageProviders.pollinations.generate("flux", "Dates", "square"), /INVALID_IMAGE/);
  assert.equal(calls, 3);
});
