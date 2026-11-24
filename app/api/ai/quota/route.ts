import { NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoreQuota, MuniraRequestError } from "@/lib/munira/quota";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const user = await requireRole("SELLER");
    if (!user.store) return NextResponse.json({ error: "لم يُربط الحساب بمتجر." }, { status: 403, headers });
    const storeId = user.store.id;
    const [quota, plans] = await Promise.all([
      getStoreQuota(prisma, storeId, new Date()),
      prisma.subscriptionPlanConfig.findMany({
        orderBy: { sortOrder: "asc" },
        select: { plan: true, nameAr: true, muniraMonthlyMessages: true, muniraTrialMessages: true },
      }),
    ]);
    const used = await prisma.muniraRequest.count({
      where: { scope: `store:${storeId}`, quotaWindow: quota.key, state: "COMPLETE" },
    });
    return NextResponse.json({
      planName: quota.planName, period: quota.key === "trial" ? "trial" : "monthly",
      limit: quota.planLimit, used, remaining: Math.max(0, quota.planLimit - used),
      active: quota.active, expired: quota.expired, available: quota.allowed ? Math.max(0, quota.limit - used) : 0,
      allowed: quota.allowed, retained: quota.retained,
      plans,
    }, { headers });
  } catch (error) {
    if (error instanceof AuthError || error instanceof MuniraRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers });
    }
    console.error("[munira-quota] Unable to read merchant quota");
    return NextResponse.json({ error: "تعذّر تحميل حصة منيرة." }, { status: 500, headers });
  }
}
