// app/api/cron/abandoned-carts/route.ts
// دورة السلات المتروكة: استرداد → كشف → تذكير المشتري + حدث التاجر.
// الاستدعاء: Vercel Cron (GET) أو scheduler خارجي (POST + x-cron-secret).
import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { detectAbandonedCarts } from "@/lib/abandoned-carts";
import { sendAbandonedCartReminders } from "@/lib/abandoned-carts-notify";

export const dynamic = "force-dynamic";

async function run() {
  const now = new Date();
  const detect = await detectAbandonedCarts(now);
  const notify = await sendAbandonedCartReminders(now);
  return { ok: true, ranAt: now.toISOString(), ...detect, ...notify };
}

async function handle(req: NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "غير مصرَّح" }, { status: 401 });
  try {
    return NextResponse.json(await run());
  } catch (err) {
    console.error("[cron/abandoned-carts]", err);
    return NextResponse.json({ error: "فشلت دورة السلات المتروكة" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
