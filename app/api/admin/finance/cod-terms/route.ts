// GET / POST — شروط حصة الناقل من رسم COD (بنسخ زمنية). لا تغيّر الطلبات السابقة (لقطة وقت الطلب).
import { NextResponse } from "next/server";
import { addCodTerms, codTermsSchema, listCodTerms } from "@/lib/finance/cod-ai-service";
import { adminRoute, parseBody } from "@/lib/finance/http";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => NextResponse.json({ terms: await listCodTerms() }));

export const POST = adminRoute(async ({ user, req }) => {
  const input = await parseBody(req, codTermsSchema);
  return NextResponse.json({ terms: await addCodTerms(user.id, input) }, { status: 201 });
});
