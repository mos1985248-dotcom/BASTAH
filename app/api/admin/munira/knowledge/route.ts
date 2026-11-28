import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeArabic } from "@/lib/munira/public-guide";

const headers = { "Cache-Control": "private, no-store" };
const article = z.object({
  question: z.string().trim().min(3).max(180),
  answer: z.string().trim().min(5).max(1500),
  aliases: z.array(z.string().trim().min(2).max(180)).max(12),
  published: z.boolean(),
}).strict();
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
function errorResponse(error: unknown) {
  if (error instanceof AuthError) return fail(error.message, error.status);
  return fail("تعذّر الوصول إلى مكتبة المعرفة. تحقق من تجهيز قاعدة البيانات.", 503);
}
export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const articles = await prisma.muniraKnowledgeArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 100 });
    const gaps = await prisma.muniraKnowledgeGap.findMany({ where: { resolved: false, lastSeenAt: { gte: new Date(Date.now() - 30 * 86400000) } }, orderBy: [{ occurrences: "desc" }, { lastSeenAt: "desc" }], take: 100 });
    return NextResponse.json({ articles, gaps }, { headers });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = article.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail("راجع السؤال والإجابة والصيغ البديلة.", 400);
    const questionKey = normalizeArabic(parsed.data.question);
    if (questionKey.length < 3) return fail("السؤال غير صالح.", 400);
    const data = { ...parsed.data, questionKey, aliases: [...new Set(parsed.data.aliases)] };
    // Serialize the library limit and upsert; never silently drop published articles.
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(73829104)`;
      const existing = await tx.muniraKnowledgeArticle.findUnique({ where: { questionKey } });
      if (!existing && await tx.muniraKnowledgeArticle.count() >= 100) return null;
      const saved = await tx.muniraKnowledgeArticle.upsert({ where: { questionKey }, create: data, update: data });
      if (data.published) await tx.muniraKnowledgeGap.updateMany({ where: { questionKey: { in: [questionKey, ...data.aliases.map(normalizeArabic)] } }, data: { resolved: true } });
      return saved;
    });
    if (!result) return fail("وصلت المكتبة إلى حد 100 مادة.", 409);
    return NextResponse.json({ article: result }, { headers });
  } catch (error) { return errorResponse(error); }
}
