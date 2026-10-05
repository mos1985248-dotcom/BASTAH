// lib/analytics.ts
// تسجيل أحداث "التسويق والتحليلات" + التقاط وسم UTM القياسي ونقله عبر كوكي
// قصير العمر حتى لحظة إتمام الطلب. مصمَّم ليعمل مع أي منصة مستقبلية (لينز،
// فيسبوك، تيك توك...) بلا أي تعديل — المنصة تُعرَّف بوسم utm_source فقط.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnalyticsEventType } from "@prisma/client";

const ATTRIBUTION_COOKIE = "basita_attr";
const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوماً — نافذة إسناد معقولة لمتجر تجزئة

export interface Utm {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

/** يقرأ utm_source/utm_medium/utm_campaign من رابط الطلب، أو undefined لكل حقل غير موجود */
export function readUtmFromUrl(url: string | URL): Utm {
  const params = (typeof url === "string" ? new URL(url) : url).searchParams;
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");
  return {
    utmSource: source?.slice(0, 50) || undefined,
    utmMedium: medium?.slice(0, 50) || undefined,
    utmCampaign: campaign?.slice(0, 100) || undefined,
  };
}

/**
 * يحفظ وسم utm بكوكي — إسناد "أول لمسة" (first-touch): إن كانت الكوكي
 * محفوظة مسبقاً من زيارة سابقة، لا تُستبدَل بوسم utm جديد من زيارة لاحقة؛
 * أول مصدر وصل منه الزائر هو الذي يبقى مُسجَّلاً طوال نافذة الإسناد.
 */
export function persistAttributionCookie(req: NextRequest, res: NextResponse, utm: Utm, productId?: string): void {
  if (!utm.utmSource) return;
  if (req.cookies.get(ATTRIBUTION_COOKIE)?.value) return; // كوكي موجودة مسبقاً — لا تُستبدَل
  const payload = JSON.stringify({ ...utm, productId: productId ?? null });
  res.cookies.set(ATTRIBUTION_COOKIE, payload, {
    maxAge: ATTRIBUTION_MAX_AGE, path: "/", sameSite: "lax", httpOnly: true,
  });
}

/** يقرأ وسم الإسناد المحفوظ من كوكي الطلب الحالي، أو null إن لم يوجد/تالف */
export function readAttributionCookie(req: NextRequest): (Utm & { productId: string | null }) | null {
  const raw = req.cookies.get(ATTRIBUTION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || !parsed) return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface RecordEventInput extends Utm {
  type: AnalyticsEventType;
  storeId: string;
  productId?: string | null;
  orderId?: string | null;
  campaignId?: string | null;
  contentId?: string | null;
  sessionId?: string | null;
  amount?: number | null;
}

/**
 * يسجّل حدثاً تحليلياً واحداً. لا يرمي أبداً — فشل التحليلات لا يجوز أن
 * يُفشل طلب المستخدم الأصلي (عرض منتج/إضافة للسلة/إتمام الطلب).
 * ⚠️ على Vercel الدوال تتوقف فور إرسال الاستجابة — لذا يجب "await" هذا
 * دائماً قبل الرد، لا استدعاءً معلَّقاً دون انتظار (fire-and-forget حقيقي
 * قد لا يكتمل كتابته أصلاً).
 */
export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        storeId: input.storeId,
        productId: input.productId ?? undefined,
        orderId: input.orderId ?? undefined,
        campaignId: input.campaignId ?? undefined,
        contentId: input.contentId ?? undefined,
        sessionId: input.sessionId ?? undefined,
        amount: input.amount ?? undefined,
        utmSource: input.utmSource ?? undefined,
        utmMedium: input.utmMedium ?? undefined,
        utmCampaign: input.utmCampaign ?? undefined,
      },
    });
  } catch (err) {
    console.error("[recordEvent]", input.type, err);
  }
}
