import { z } from "zod";
import { authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireStoreFeature } from "@/lib/feature-access";

const couponInput = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive().max(100000),
}).refine(row => row.discountType !== "percentage" || row.discountValue <= 100);

export async function GET() {
  try {
    const { storeId } = await requireStoreFeature("coupons");
    const coupons = await prisma.coupon.findMany({ where: { storeId }, orderBy: { createdAt: "desc" } });
    return Response.json({ coupons });
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const { storeId } = await requireStoreFeature("coupons");
    const parsed = couponInput.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "تحقق من الرمز وقيمة الخصم." }, { status: 400 });
    const result = await prisma.coupon.createMany({ data: [{ storeId, ...parsed.data, isActive: false }], skipDuplicates: true });
    if (!result.count) return Response.json({ error: "رمز الخصم موجود بالفعل." }, { status: 409 });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { return authErrorResponse(error); }
}
