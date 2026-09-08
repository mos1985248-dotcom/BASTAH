// lib/prisma.ts
// Prisma Client Singleton
//
// لماذا singleton: في بيئة serverless (Vercel) وفي dev مع hot-reload،
// كل استدعاء لـ `new PrismaClient()` يفتح اتصال جديد بقاعدة البيانات.
// بدون هذا النموذج، التطوير المحلي يستهلك كل connections متاحة بسرعة
// (خاصية Next.js Fast Refresh تُعيد تحميل الموديولات كثيراً).

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
    // Prisma Accelerate / PgBouncer متوافق — استخدمي DATABASE_URL مع ?pgbouncer=true
    // في الإنتاج لتجنّب استهلاك connections مباشرة من serverless functions
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
