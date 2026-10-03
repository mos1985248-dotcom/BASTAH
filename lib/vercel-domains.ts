// lib/vercel-domains.ts
// ربط الدومين المخصص آلياً عبر Vercel REST API (إضافة الدومين للمشروع، قراءة
// سجلات DNS المطلوبة، التحقق، الحذف). السيرفر فقط — يقرأ متغيرات البيئة:
//   VERCEL_API_TOKEN   (إجباري) توكن بصلاحية على هذا المشروع
//   VERCEL_PROJECT_ID  (إجباري) معرّف المشروع prj_...
//   VERCEL_TEAM_ID     (اختياري) فقط إن كان المشروع تحت Team لا حساب شخصي
//
// المسارات مأخوذة من وثائق Vercel الرسمية:
//   POST   /v10/projects/{id}/domains            إضافة (400 = مضاف مسبقاً، 409 = بمشروع آخر)
//   GET    /v9/projects/{id}/domains/{domain}    verified + verification (تحدي TXT)
//   POST   /v9/projects/{id}/domains/{domain}/verify
//   GET    /v6/domains/{domain}/config           misconfigured + recommendedCNAME/IPv4
//   DELETE /v9/projects/{id}/domains/{domain}

import type { DnsRecord, DomainState, DomainStatus } from "./domain-types";

const API = "https://api.vercel.com";

export class VercelDomainError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

/** خطأ يُعرض للتاجر كما هو (رسالة عربية آمنة) — غيره يُسجَّل بالسيرفر فقط */
export class DomainUserError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function isVercelDomainsConfigured(): boolean {
  return !!(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
}

function url(path: string, extra: Record<string, string> = {}): string {
  const u = new URL(path, API);
  if (process.env.VERCEL_TEAM_ID) u.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
  return u.toString();
}

async function call(method: string, path: string, body?: unknown, extra?: Record<string, string>) {
  const res = await fetch(url(path, extra), {
    method,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", // حالة DNS تتغيّر — لا نريد نتيجة مخزَّنة قديمة
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new VercelDomainError(data?.error?.message ?? `Vercel API ${res.status}`, res.status, data?.error?.code);
  }
  return data;
}

const projectPath = () => `/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`;

/** أقل rank = الأفضل حسب Vercel */
function best<T extends { rank: number | string }>(items: T[] | undefined): T | undefined {
  return [...(items ?? [])].sort((a, b) => Number(a.rank) - Number(b.rank))[0];
}

/** يضيف الدومين للمشروع. لا يفشل إن كان مضافاً مسبقاً لنفس المشروع. */
export async function addDomainToProject(domain: string): Promise<void> {
  try {
    await call("POST", `/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, { name: domain });
  } catch (err) {
    if (!(err instanceof VercelDomainError)) throw err;
    if (err.status === 400 && /already|exist/i.test(err.message)) return; // مضاف مسبقاً لنفس المشروع
    if (err.status === 409) {
      throw new DomainUserError("هذا الدومين مربوط بحساب أو مشروع آخر على Vercel — أزيليه من هناك أولاً أو تواصلي مع الدعم", 409);
    }
    if (err.status === 400) throw new DomainUserError("الدومين غير صالح — تأكدي من كتابته بدون http:// أو مسافات");
    throw err;
  }
}

export async function removeDomainFromProject(domain: string): Promise<void> {
  try {
    await call("DELETE", `${projectPath()}/${encodeURIComponent(domain)}`);
  } catch (err) {
    if (err instanceof VercelDomainError && err.status === 404) return; // غير موجود أصلاً = المطلوب تحقق
    throw err;
  }
}

/** يحاول التحقق من الملكية (تحدي TXT). فشله ليس خطأ — الحالة تُقرأ بعده. */
async function tryVerify(domain: string): Promise<void> {
  try {
    await call("POST", `${projectPath()}/${encodeURIComponent(domain)}/verify`);
  } catch {
    /* التحدي لم يكتمل بعد — نقرأ الحالة الفعلية بعد هذا */
  }
}

export async function getDomainStatus(domain: string, opts: { verify?: boolean } = {}): Promise<DomainStatus> {
  if (opts.verify) await tryVerify(domain);

  const project = await call("GET", `${projectPath()}/${encodeURIComponent(domain)}`);
  const verified: boolean = project.verified === true;
  const isApex: boolean = project.apexName ? project.name === project.apexName : domain.split(".").length === 2;

  if (!verified) {
    const records: DnsRecord[] = ((project.verification ?? []) as { type: string; domain: string; value: string }[])
      .filter((v) => v.type === "TXT")
      .map((v) => ({ type: "TXT" as const, name: v.domain, value: v.value }));
    return { domain, state: "PENDING_OWNERSHIP", records };
  }

  const config = await call("GET", `/v6/domains/${encodeURIComponent(domain)}/config`, undefined, {
    projectIdOrName: process.env.VERCEL_PROJECT_ID!,
  });
  if (config.misconfigured !== true) return { domain, state: "CONNECTED", records: [] };

  const records: DnsRecord[] = [];
  if (isApex) {
    const ip = best<{ rank: number | string; value: string[] }>(config.recommendedIPv4)?.value?.[0];
    if (ip) records.push({ type: "A", name: "@", value: ip });
  } else {
    const cname = best<{ rank: number | string; value: string }>(config.recommendedCNAME)?.value;
    if (cname) records.push({ type: "CNAME", name: domain.split(".")[0], value: cname });
  }
  const state: DomainState = "PENDING_DNS";
  return { domain, state, records };
}
