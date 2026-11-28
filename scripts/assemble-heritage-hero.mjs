import { createHash } from "node:crypto";
import { readFile, readdir, rename, writeFile } from "node:fs/promises";

const parts = new URL("../assets/heritage-hero/", import.meta.url);
const target = new URL("../public/videos/bastah-heritage-premium-15s.mp4", import.meta.url);
const temporary = new URL(`${target.href}.tmp`);
const names = (await readdir(parts)).filter((name) => /^part-\d{2}$/.test(name)).sort();
const video = Buffer.concat(await Promise.all(names.map((name) => readFile(new URL(name, parts)))));
const checksum = createHash("sha256").update(video).digest("hex");
if (checksum !== "47dbaabb2e4bb516f24d3d0a180385382d8e1654d18b8f85e7df68d4e2449aed") {
  throw new Error("The heritage hero video parts are missing or damaged.");
}

await writeFile(temporary, video);
await rename(temporary, target);
