// scripts/dev-webhook-receiver.mjs
// مستقبِل ويب هوك محلي للتطوير: يطبع كل حدث يرسله نظام التكاملات ويتحقق من توقيع
// HMAC-SHA256 بنفس المفتاح السري الذي أدخلتِه في لوحة الإدارة. لا يعتمد على أي خدمة خارجية.
//
//   set WEBHOOK_SECRET=المفتاح_السري        (ويندوز cmd)
//   node scripts/dev-webhook-receiver.mjs   (المنفذ الافتراضي 4000، أو: set PORT=4100)
//
// للتطوير فقط — لا تشغّليه على خادم عام.

import crypto from "node:crypto";
import http from "node:http";

const secret = process.env.WEBHOOK_SECRET;
const port = Number(process.env.PORT || 4000);
if (!secret) {
  console.error("اضبطي WEBHOOK_SECRET أولاً (نفس المفتاح السري في لوحة الإدارة).");
  process.exit(1);
}

http
  .createServer((req, res) => {
    if (req.method !== "POST") { res.writeHead(200); res.end("receiver ready"); return; }
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 1_000_000) req.destroy(); });
    req.on("end", () => {
      const ts = String(req.headers["x-basita-timestamp"] ?? "");
      const sig = String(req.headers["x-basita-signature"] ?? "");
      const expected = "sha256=" + crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
      const a = Buffer.from(sig), b = Buffer.from(expected);
      const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
      const ageSec = Math.abs(Date.now() / 1000 - Number(ts));
      const fresh = Number.isFinite(ageSec) && ageSec < 300;

      console.log("\n──────────────────────────────────────────");
      console.log(new Date().toLocaleTimeString("ar-SA"), "| الحدث:", req.headers["x-basita-event"]);
      console.log("التوقيع:", valid ? "✔ صحيح" : "✘ غير صحيح", "| الطابع الزمني:", fresh ? "✔ حديث" : "✘ قديم");
      try { console.log(JSON.stringify(JSON.parse(body), null, 2)); } catch { console.log(body); }

      res.writeHead(valid && fresh ? 200 : 401, { "Content-Type": "application/json" });
      res.end("{}");
    });
  })
  .listen(port, () => console.log(`المستقبِل يعمل على http://localhost:${port} — بانتظار الأحداث...`));
