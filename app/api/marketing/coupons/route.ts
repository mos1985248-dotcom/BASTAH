import { z } from "zod";
import { authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireStoreFeature } from "@/lib/feature-access";

const couponInput = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive().max(100000),
  minOrderAmt: z.number().nonnegative().max(1000000).optional(),
  maxUses: z.number().int().positive().max(1000000).optional(),
  expiryDate: z.string().date().optional(),
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
    const { expiryDate, ...fields } = parsed.data;
    const expiresAt = expiryDate ? new Date(new Date(`${expiryDate}T00:00:00+03:00`).getTime() + 86_400_000) : null;
    if (expiresAt && expiresAt <= new Date()) return Response.json({ error: "اختاري تاريخ انتهاء مستقبليًا أو تاريخ اليوم." }, { status: 400 });
    const result = await prisma.coupon.createMany({ data: [{ storeId, ...fields, expiresAt, isActive: false }], skipDuplicates: true });
    if (!result.count) return Response.json({ error: "رمز الخصم موجود بالفعل." }, { status: 409 });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { return authErrorResponse(error); }
}

const toggleInput = z.object({ id: z.string().cuid(), isActive: z.boolean() });

export async function PATCH(req: Request) {
  try {
    const { storeId } = await requireStoreFeature("coupons");
    const parsed = toggleInput.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "بيانات الكوبون غير صالحة." }, { status: 400 });
    const { id, isActive } = parsed.data;
    const coupon = await prisma.coupon.findFirst({ where: { id, storeId } });
    if (!coupon) return Response.json({ error: "الكوبون غير موجود." }, { status: 404 });
    if (isActive && ((coupon.expiresAt && coupon.expiresAt <= new Date()) ||
      (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses))) {
      return Response.json({ error: "انتهت صلاحية الكوبون أو بلغ حد الاستخدام." }, { status: 409 });
    }
    await prisma.coupon.updateMany({ where: { id, storeId }, data: { isActive } });
    return Response.json({ ok: true });
  } catch (error) { return authErrorResponse(error); }
}
