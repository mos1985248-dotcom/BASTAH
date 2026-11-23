// يُستورد أولاً في اختبارات الخدمات: يحقن القاعدة الوهمية قبل تحميل lib/prisma.ts (الذي يقرأ globalThis.prisma إن وُجد).
import { createFakeDb } from "./fake-db";

export const fake = createFakeDb();
(globalThis as unknown as { prisma: unknown }).prisma = fake.db;
