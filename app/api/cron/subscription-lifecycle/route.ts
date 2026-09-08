// app/api/cron/subscription-lifecycle/route.ts
// ⚠️ لا يوجد بنية Cron داخلية بهذا المشروع (Next.js لا يُشغّل مهام مجدولة
// من تلقاء نفسه). هذا المسار يدعم مصدرين للاستدعاء الدوري معاً:
//
// 1) Vercel Cron (vercel.json بالجذر) — يُرسل GET حصراً (مؤكَّد من توثيق
//    Vercel الرسمي)، ويحقن CRON_SECRET تلقائياً كـ"Authorization: Bearer
//    <CRON_SECRET>" بمجرد ضبط متغيّر بيئة بنفس الاسم بإعدادات المشروع —
//    لا حاجة لأي إعداد header يدوي بجهتنا.
// 2) أي scheduler خارجي محمول (GitHub Actions + curl، crontab + curl،
//    إلخ) — يدعم POST بنفس السرّ عبر ترويسة x-cron-secret المخصَّصة، لأن
//    هذه الأدوات لا تُلزَم بصيغة Authorization المحدَّدة.
//
// كلا المسارين يُنفّذان بالضبط نفس منطق الدورة (لم يتغيّر حرفاً واحداً):
// 1) تذكير قبل الانتهاء (3 أيام) — مرة واحدة فقط لكل endDate (نتحقق من
//    عدم وجود إشعار سابق لنفس endDate بدل إضافة حقل تتبّع جديد للسكيما)
// 2) اشتراك ACTIVE انتهى endDate ولم يُجدَّد → GRACE_PERIOD (+7 أيام)
// 3) اشتراك بفترة سماح انتهت gracePeriodEndsAt → SUSPENDED

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic"; // يمنع أي تخزين مؤقت لنتيجة سابقة — Vercel قد يخزّن استجابات GET افتراضياً

const GRACE_PERIOD_DAYS = 7;
const REMINDER_DAYS_BEFORE = 3;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  // مسار Vercel الأصلي (تلقائي بالكامل من جهتهم)
  const authHeader = req.headers.get("authorization");
  if (authHeader && timingSafeEqual(authHeader, `Bearer ${cronSecret}`)) return true;

  // مسار scheduler خارجي محمول
  const customHeader = req.headers.get("x-cron-secret");
  if (customHeader && timingSafeEqual(customHeader, cronSecret)) return true;

  return false;
}

async function runSubscriptionLifecycle() {
  const now = new Date();
  const summary = { reminders: 0, gracePeriod: 0, suspended: 0 };

  // ── 1) تذكير قرب الانتهاء (اشتراك ACTIVE ينتهي خلال 3 أيام) ────────
  const reminderWindowEnd = new Date(now.getTime() + REMINDER_DAYS_BEFORE * 24 * 60 * 60 * 1000);
  const expiringSoon = await prisma.storeSubscription.findMany({
    where: { status: "ACTIVE", plan: { not: "FREE" }, endDate: { lte: reminderWindowEnd, gt: now } },
    include: { store: { select: { userId: true, nameAr: true } } },
  });
  for (const sub of expiringSoon) {
    if (!sub.endDate) continue;
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId: sub.store.userId,
        type: "SYSTEM",
        data: { path: ["subscriptionReminderForEndDate"], equals: sub.endDate.toISOString() },
      },
    });
    if (existingReminder) continue;

    await createNotification({
      userId: sub.store.userId,
      type: "SYSTEM",
      titleAr: "اشتراكك على وشك الانتهاء",
      bodyAr: `اشتراك متجرك "${sub.store.nameAr}" ينتهي خلال ${REMINDER_DAYS_BEFORE} أيام — جدّديه لتفادي تعليق المتجر`,
      data: { subscriptionReminderForEndDate: sub.endDate.toISOString() },
    }).catch(() => {});
    summary.reminders++;
  }

  // ── 2) انتهت المدة ولم تُجدَّد → فترة سماح ──────────────────────────
  const expiredActive = await prisma.storeSubscription.findMany({
    where: { status: "ACTIVE", endDate: { lt: now } },
    include: { store: { select: { userId: true, nameAr: true } } },
  });
  for (const sub of expiredActive) {
    const result = await prisma.storeSubscription.updateMany({
      where: { id: sub.id, status: "ACTIVE" }, // idempotent guard
      data: {
        status: "GRACE_PERIOD",
        lastPaymentFailedAt: now,
        gracePeriodEndsAt: new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000),
      },
    });
    if (result.count === 0) continue;

    await createNotification({
      userId: sub.store.userId,
      type: "PAYMENT",
      titleAr: "انتهى اشتراكك — أمامك مهلة",
      bodyAr: `انتهى اشتراك متجرك "${sub.store.nameAr}" ولم يُجدَّد — أمامك ${GRACE_PERIOD_DAYS} أيام لتجديده قبل تعليق المتجر`,
      data: { plan: sub.plan },
    }).catch(() => {});
    summary.gracePeriod++;
  }

  // ── 3) انتهت فترة السماح → تعليق ────────────────────────────────────
  const graceExpired = await prisma.storeSubscription.findMany({
    where: { status: "GRACE_PERIOD", gracePeriodEndsAt: { lt: now } },
    include: { store: { select: { userId: true, nameAr: true } } },
  });
  for (const sub of graceExpired) {
    const result = await prisma.storeSubscription.updateMany({
      where: { id: sub.id, status: "GRACE_PERIOD" },
      data: { status: "SUSPENDED", suspendedAt: now },
    });
    if (result.count === 0) continue;

    await createNotification({
      userId: sub.store.userId,
      type: "PAYMENT",
      titleAr: "تم تعليق متجرك",
      bodyAr: `تم تعليق متجرك "${sub.store.nameAr}" لعدم تجديد الاشتراك — منتجاتك لم تعد ظاهرة للعملاء. جدّدي اشتراكك لإعادة التفعيل فوراً`,
      data: { plan: sub.plan },
    }).catch(() => {});
    summary.suspended++;
  }

  return { ok: true, ranAt: now.toISOString(), ...summary };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غير مصرَّح" }, { status: 401 });
  }
  const result = await runSubscriptionLifecycle();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غير مصرَّح" }, { status: 401 });
  }
  const result = await runSubscriptionLifecycle();
  return NextResponse.json(result);
}
