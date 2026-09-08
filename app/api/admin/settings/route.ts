// app/api/admin/settings/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي) — يستخدم PlatformSetting الموجود أصلاً
// بالسكيما (كان جدولاً جاهزاً بدون أي استخدام). يجعل رسوم الشحن التشغيلية
// ورسوم الدفع عند الاستلام قابلتين للضبط فعلياً من الإدارة، بدل أرقام
// ثابتة مكتوبة داخل الكود.

import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { z } from "zod";
import { SETTINGS_KEYS, getBasitaShippingFee, getCodFee, setNumericSetting } from "@/lib/platform-settings";

const updateSchema = z.object({
  basitaShippingFee: z.coerce.number().min(0).max(200).optional(),
  codFee: z.coerce.number().min(0).max(200).optional(),
});

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const [basitaShippingFee, codFee] = await Promise.all([getBasitaShippingFee(), getCodFee("CASH_ON_DELIVERY")]);
    return NextResponse.json({ basitaShippingFee, codFee });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/settings]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "قيم غير صالحة" }, { status: 400 });

    if (parsed.data.basitaShippingFee !== undefined) {
      await setNumericSetting(SETTINGS_KEYS.BASITA_SHIPPING_FEE, parsed.data.basitaShippingFee);
    }
    if (parsed.data.codFee !== undefined) {
      await setNumericSetting(SETTINGS_KEYS.COD_FEE, parsed.data.codFee);
    }

    const [basitaShippingFee, codFee] = await Promise.all([getBasitaShippingFee(), getCodFee("CASH_ON_DELIVERY")]);
    return NextResponse.json({ basitaShippingFee, codFee });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/admin/settings]", err);
    return NextResponse.json({ error: "تعذّر حفظ الإعدادات" }, { status: 500 });
  }
}
