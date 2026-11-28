import { createHash } from "node:crypto";
import { readFile, readdir, rename, writeFile } from "node:fs/promises";

const parts = new URL("../assets/heritage-hero/", import.meta.url);
const target = new URL("../public/videos/bastah-heritage-readex-logo.mp4", import.meta.url);
const temporary = new URL(`${target.href}.tmp`);
const names = (await readdir(parts)).filter((name) => /^part-\d{2}$/.test(name)).sort();
const video = Buffer.concat(await Promise.all(names.map((name) => readFile(new URL(name, parts)))));
const checksum = createHash("sha256").update(video).digest("hex");
if (checksum !== "c696a11a153c261e8e3c2b6d0bde53361f398f330ca5281d6d7125c8e2a655fa") {
  throw new Error("The heritage hero video parts are missing or damaged.");
}

await writeFile(temporary, video);
await rename(temporary, target);
