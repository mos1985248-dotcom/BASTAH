// app/api/stores/domain/route.ts
// دومين مخصص — التاجر يحفظ دومينه هنا فقط إذا فتحت له الإدارة الميزة مسبقاً
// (customDomainEnabled، بعد تحقق الإدارة من اشتراكه). عند ضبط متغيرات Vercel
// (VERCEL_API_TOKEN + VERCEL_PROJECT_ID) يُضاف الدومين للمشروع آلياً ونرجع
// للتاجر سجلات DNS المطلوبة وحالة الربط. بدونها يعمل بالوضع اليدوي السابق
// (حفظ القيمة فقط) دون أي خطأ.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { updateCustomDomainSchema, formatZodError } from "@/lib/validation";
import {
  isVercelDomainsConfigured, addDomainToProject, removeDomainFromProject, getDomainStatus, DomainUserError,
} from "@/lib/vercel-domains";
import type { DomainStatus } from "@/lib/domain-types";

const NOT_ENABLED = "ميزة الدومين المخصص غير مفعّلة لمتجرك — تواصلي مع الدعم";

async function safeStatus(domain: string, verify = false): Promise<DomainStatus | null> {
  try {
    return await getDomainStatus(domain, { verify });
  } catch (err) {
    console.error("[domain status]", err);
    return null; // لا نُسقط الطلب كله لأن قراءة الحالة فشلت — الواجهة تعرض "تعذّر التحقق"
  }
}

// ── GET — الحالة الحيّة من Vercel (?verify=1 يحاول التحقق من الملكية أولاً) ──
export async function GET(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { customDomain: true, customDomainEnabled: true } });
    if (!store?.customDomainEnabled) return NextResponse.json({ error: NOT_ENABLED }, { status: 403 });

    const automation = isVercelDomainsConfigured();
    const status = automation && store.customDomain
      ? await safeStatus(store.customDomain, req.nextUrl.searchParams.get("verify") === "1")
      : null;
    return NextResponse.json({ customDomain: store.customDomain, automation, status });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/stores/domain]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── PATCH — حفظ الدومين (أو إزالته بـnull) ──
export async function PATCH(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();

    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { customDomain: true, customDomainEnabled: true } });
    if (!store?.customDomainEnabled) return NextResponse.json({ error: NOT_ENABLED }, { status: 403 });

    const parsed = updateCustomDomainSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const { customDomain } = parsed.data;
    const previous = store.customDomain;

    if (customDomain) {
      const taken = await prisma.store.findFirst({ where: { customDomain, id: { not: storeId } }, select: { id: true } });
      if (taken) return NextResponse.json({ error: "هذا الدومين مُستخدَم لمتجر آخر بالفعل" }, { status: 409 });
    }

    const automation = isVercelDomainsConfigured();

    // نضيفه لـVercel قبل حفظه بقاعدتنا: لو رفضه Vercel (مربوط بمشروع آخر مثلاً) لا نحفظ قيمة لن تعمل
    if (automation && customDomain && customDomain !== previous) {
      try {
        await addDomainToProject(customDomain);
      } catch (err) {
        if (err instanceof DomainUserError) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error("[PATCH /api/stores/domain] add", err);
        return NextResponse.json({ error: "تعذّر الاتصال بخدمة ربط الدومين — حاولي بعد قليل" }, { status: 502 });
      }
    }

    const updated = await prisma.store.update({ where: { id: storeId }, data: { customDomain }, select: { customDomain: true } });

    // إزالة الدومين القديم من Vercel (تنظيف فقط — فشله لا يُفشل حفظ التاجر)
    // (بـawait داخل try: على Vercel قد تُجمَّد الدالة بعد الرد فلا يكتمل طلب غير منتظَر)
    if (automation && previous && previous !== customDomain) {
      try {
        await removeDomainFromProject(previous);
      } catch (err) {
        console.error("[PATCH /api/stores/domain] remove old", err);
      }
    }

    const status = automation && updated.customDomain ? await safeStatus(updated.customDomain) : null;
    return NextResponse.json({ store: updated, automation, status });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/stores/domain]", err);
    return NextResponse.json({ error: "تعذّر حفظ الدومين" }, { status: 500 });
  }
}
