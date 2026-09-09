// lib/notifications.ts
// دالة مركزية لإنشاء الإشعارات من أي route أو cron.
// Supabase Realtime يُطلق تلقائياً عند INSERT لأننا فعّلنا publication
// لجدول notifications في supabase-setup.sql (ALTER PUBLICATION supabase_realtime
// ADD TABLE notifications). الواجهة تستمع عبر useNotifications hook أدناه.

import { prisma } from "./prisma";
import type { NotificationType } from "@prisma/client";
import { Prisma } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  titleAr: string;
  titleEn?: string;
  bodyAr: string;
  bodyEn?: string;
  data?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId:   params.userId,
      type:     params.type,
      titleAr:  params.titleAr,
      titleEn:  params.titleEn ?? null,
      bodyAr:   params.bodyAr,
      bodyEn:   params.bodyEn ?? null,
      data: (params.data ?? {}) as Prisma.InputJsonValue,
    },
  });
}

// ── ربط الإشعارات بالأحداث الموجودة ──────────────────────
// نضيف استدعاءات createNotification داخل:
// - app/api/payments/moyasar/webhook/route.ts (عند PAID → إشعار للمشتري + البائع)
// - app/api/orders/[id]/route.ts (عند SHIPPED → إشعار للمشتري بالتتبع)
// هذا يُبقي منطق الأعمال في مكانه الصحيح ويفصل إنشاء الإشعار عن إرساله.
