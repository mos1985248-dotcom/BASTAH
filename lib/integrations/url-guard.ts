// lib/integrations/url-guard.ts
// حماية SSRF: التاجر يدخل رابط الويب هوك بنفسه، فلا يجوز أن يوجّه الخادم
// إلى شبكة داخلية (localhost / 10.x / 169.254.169.254 ميتاداتا السحابة...).
// نقبل https فقط، ونفحص كل عناوين IP الناتجة عن DNS قبل الإرسال.

import { lookup } from "dns/promises";
import net from "net";

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase();
  if (v6 === "::1" || v6 === "::" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80")) return true;
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateIPv4(mapped[1]) : false;
}

/** يرمي خطأ بسبب عربي واضح إن كان الرابط غير آمن؛ يرجع URL المُحلَّل إن كان سليماً */
export async function assertSafeOutboundUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("رابط الويب هوك غير صحيح");
  }
  if (url.protocol !== "https:") throw new Error("رابط الويب هوك يجب أن يبدأ بـ https://");
  if (url.username || url.password) throw new Error("لا يُسمح ببيانات دخول داخل الرابط");

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("لا يُسمح بروابط الشبكة الداخلية");
  }

  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (addrs.length === 0) throw new Error("تعذّر الوصول إلى نطاق الرابط");
  if (addrs.some((a) => isPrivateIp(a.address))) throw new Error("لا يُسمح بروابط الشبكة الداخلية");
  return url;
}
