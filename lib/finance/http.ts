// lib/finance/http.ts — غلاف مسارات المركز المالي: صلاحية الإدارة على الخادم، وتوحيد الأخطاء، وتحليل الشهر.
import { NextRequest, NextResponse } from "next/server";
import { z, type ZodTypeAny } from "zod";
import { AuthError, requireRole, type AuthedUser } from "@/lib/auth";
import { riyadhMonthOf, type MonthKey } from "./riyadh";
import { FinanceError } from "./tx";

export type AdminCtx<P> = { user: AuthedUser; req: NextRequest; params: P };

/** كل مسار مالي محمي بـADMIN/SUPER_ADMIN على الخادم؛ الأخطاء المتوقعة تُرجع رسالة عربية، وغيرها 500 بلا تفاصيل داخلية. */
export function adminRoute<P = Record<string, never>>(handler: (ctx: AdminCtx<P>) => Promise<Response>) {
  return async (req: NextRequest, route: { params: P }): Promise<Response> => {
    try {
      const user = await requireRole("ADMIN", "SUPER_ADMIN");
      return await handler({ user, req, params: route?.params ?? ({} as P) });
    } catch (err) {
      if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
      if (err instanceof FinanceError) return NextResponse.json({ error: err.message }, { status: err.status });
      console.error("[finance]", err instanceof Error ? err.message : "unknown");
      return NextResponse.json({ error: "تعذّر تنفيذ العملية" }, { status: 500 });
    }
  };
}

export async function parseBody<S extends ZodTypeAny>(req: NextRequest, schema: S): Promise<z.infer<S>> {
  let json: unknown;
  try { json = await req.json(); } catch { throw new FinanceError("جسم الطلب غير صالح"); }
  const result = schema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new FinanceError(`${issue?.message && issue.message !== "Required" ? issue.message : "بيانات غير صالحة"}${issue?.path?.length ? ` (${issue.path.join(".")})` : ""}`);
  }
  return result.data;
}

/** year/month من الرابط، وإلا الشهر الحالي بتوقيت الرياض. */
export function monthFromUrl(url: URL): MonthKey {
  const now = riyadhMonthOf(new Date());
  const y = Number(url.searchParams.get("year") ?? now.year);
  const m = Number(url.searchParams.get("month") ?? now.month);
  if (!Number.isInteger(y) || y < 2024 || y > 2100 || !Number.isInteger(m) || m < 1 || m > 12) throw new FinanceError("الشهر أو السنة غير صالحين");
  return { year: y, month: m };
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" },
  });
}
