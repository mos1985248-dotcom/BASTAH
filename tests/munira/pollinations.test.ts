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

test("Pollinations trims the branded bottom strip while preserving clean images", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const pixels = Buffer.alloc(100 * 100 * 3, 255);
  for (let offset = 95 * 100 * 3; offset < pixels.length; offset += 3) {
    pixels[offset + 1] = 0;
    pixels[offset + 2] = 0;
  }
  const fixture = await sharp(pixels, { raw: { width: 100, height: 100, channels: 3 } }).png().toBuffer();
  async function bottomPixel(branded: boolean) {
    globalThis.fetch = async () => new Response(new Uint8Array(fixture), {
      headers: branded ? { "Content-Type": "image/png", "x-pollinations-logo": "present" } : { "Content-Type": "image/png" },
    });
    const image = await imageProviders.pollinations.generate("flux", "Dates", "square");
    return sharp(image.buffer).extract({ left: 512, top: 1010, width: 1, height: 1 }).raw().toBuffer();
  }
  assert.ok((await bottomPixel(true))[1] > 240);
  assert.ok((await bottomPixel(false))[1] < 20);
});

test("Pollinations requests and returns the exact preset dimensions", async t => {
  const fixture = await sharp({ create: { width: 32, height: 32, channels: 3, background: "white" } }).png().toBuffer();
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const presets = [
    ["product", 1200, 1200], ["store_logo", 1024, 1024], ["store_cover", 1800, 600],
    ["square_ad", 1080, 1080], ["story_ad", 1080, 1920],
  ] as const;
  for (const [kind, width, height] of presets) {
    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      assert.equal(url.searchParams.get("width"), String(width));
      assert.equal(url.searchParams.get("height"), String(height));
      return new Response(new Uint8Array(fixture), { headers: { "Content-Type": "image/png" } });
    };
    const generated = await imageProviders.pollinations.generate("flux", "Example", kind);
    const output = await sharp(generated.buffer).metadata();
    assert.equal(output.width, width);
    assert.equal(output.height, height);
  }
});
