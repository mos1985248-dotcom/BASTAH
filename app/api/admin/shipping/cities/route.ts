import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listBastahCities, normalizeCity, citySchema, CITY_PREFIX } from "@/lib/shipping/bastah-cities";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { z } from "zod";
export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const [cities, couriers] = await Promise.all([listBastahCities(), prisma.cityCourier.findMany({ select: { id: true, city: true, name: true, isActive: true, commissionPerShipment: true } })]);
    return NextResponse.json({ cities: cities.map(c => ({ ...c, couriers: couriers.filter(x => normalizeCity(x.city) === normalizeCity(c.name)) })) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "تعذّر تحميل المدن" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = z.object({ key: z.string().regex(/^bastah_shipping_city_[0-9]+$/), isActive: z.boolean(), flatFee: z.number().finite().min(0).max(100000), perKgFee: z.number().finite().min(0).max(100000) }).strict().safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "بيانات المدينة غير صحيحة" }, { status: 400 });
    const { key, ...settings } = parsed.data;
    const row = await prisma.platformSetting.findUnique({ where: { key } });
    if (!row || !key.startsWith(CITY_PREFIX)) return NextResponse.json({ error: "المدينة غير موجودة" }, { status: 404 });
    const before = citySchema.parse(JSON.parse(row.value));
    const city = { ...before, ...settings };
    await prisma.platformSetting.update({ where: { key }, data: { value: JSON.stringify(city) } });
    await logAudit({ actorId: admin.id, action: "SHIPPING_PROVIDER_ADDED", targetType: "PlatformSetting", targetId: row.id, metadata: { event: "bastah_city_updated", before, after: city }, ipAddress: getClientIp(req.headers) });
    return NextResponse.json({ city });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "تعذّر حفظ المدينة" }, { status: 500 });
  }
}
