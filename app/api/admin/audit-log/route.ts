// app/api/admin/audit-log/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const { searchParams } = new URL(req.url);
    const page       = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit      = Math.min(100, Number(searchParams.get("limit") ?? 30));
    const targetType = searchParams.get("targetType") ?? "";
    const action     = searchParams.get("action") ?? "";

    const where: any = {};
    if (targetType) where.targetType = targetType;
    if (action)     where.action     = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // targetId متعدد الأشكال بلا FK (راجع AuditLog بالسكيما) — نحلّ اسم الهدف
    // بطلب واحد لكل نوع (لا استعلام لكل صف)، وما لم يُوجد (محذوف) يبقى null.
    const idsOf = (type: string) => [...new Set(logs.filter((l) => l.targetType === type).map((l) => l.targetId))];
    const load = async <T,>(ids: string[], fn: (ids: string[]) => Promise<T[]>): Promise<T[]> =>
      ids.length ? fn(ids) : [];

    const [stores, users, couriers, providers, creds] = await Promise.all([
      load(idsOf("Store"), (ids) => prisma.store.findMany({ where: { id: { in: ids } }, select: { id: true, nameAr: true, slug: true } })),
      load(idsOf("User"), (ids) => prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } })),
      load(idsOf("CityCourier"), (ids) => prisma.cityCourier.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, city: true } })),
      load(idsOf("ShippingProviderConfig"), (ids) => prisma.shippingProviderConfig.findMany({ where: { id: { in: ids } }, select: { id: true, displayNameAr: true, carrierKey: true } })),
      load(idsOf("PlatformCarrierCredential"), (ids) => prisma.platformCarrierCredential.findMany({ where: { id: { in: ids } }, select: { id: true, carrier: true } })),
    ]);

    const targets = new Map<string, { name: string; sub?: string }>();
    stores.forEach((x) => targets.set(`Store:${x.id}`, { name: x.nameAr, sub: x.slug }));
    users.forEach((x) => targets.set(`User:${x.id}`, { name: x.name, sub: x.email }));
    couriers.forEach((x) => targets.set(`CityCourier:${x.id}`, { name: x.name, sub: x.city }));
    providers.forEach((x) => targets.set(`ShippingProviderConfig:${x.id}`, { name: x.displayNameAr, sub: x.carrierKey }));
    creds.forEach((x) => targets.set(`PlatformCarrierCredential:${x.id}`, { name: x.carrier }));

    const enriched = logs.map((l) => ({ ...l, target: targets.get(`${l.targetType}:${l.targetId}`) ?? null }));

    return NextResponse.json({ logs: enriched, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
