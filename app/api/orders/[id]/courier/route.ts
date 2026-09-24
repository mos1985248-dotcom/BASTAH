// app/api/orders/[id]/courier/route.ts
// بسطة للشحن — التاجر يختار مندوباً من مدينة المشتري فيُنشأ Shipment
// ويرجع رابط واتساب جاهز. requireActiveStore + ownership صارم.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { dispatchCourierSchema, formatZodError } from "@/lib/validation";
import { buildCourierMessage, buildWhatsAppUrl, COURIER_CARRIER_LABEL } from "@/lib/couriers";

interface Params {
  params: { id: string };
}

const DISPATCHABLE = ["CONFIRMED", "PROCESSING"];
const INACTIVE_SHIPMENT = ["FAILED", "RETURNED"] as const;

async function loadOwnedOrder(orderId: string, storeId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true, orderNumber: true, storeId: true, status: true, fulfillmentMethod: true, paymentMethod: true, total: true,
      shippingName: true, shippingPhone: true, shippingCity: true, shippingAddress: true,
      store: { select: { nameAr: true, city: true, whatsapp: true } },
    },
  });
  return order && order.storeId === storeId ? order : null;
}

// ── GET — مناديب مدينة المشتري + الإسناد الحالي (بدون كشف أرقام المناديب) ──
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const order = await loadOwnedOrder(params.id, storeId);
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const [couriers, current] = await Promise.all([
      prisma.cityCourier.findMany({
        where: { isActive: true, city: { equals: order.shippingCity.trim(), mode: "insensitive" } },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.shipment.findFirst({
        where: { orderId: order.id, courierId: { not: null }, status: { notIn: [...INACTIVE_SHIPMENT] } },
        orderBy: { createdAt: "desc" },
        select: { status: true, courier: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      city: order.shippingCity,
      couriers,
      current: current ? { courierName: current.courier?.name ?? null, status: current.status } : null,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/orders/[id]/courier]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── POST — إسناد الطلب لمندوب + رابط واتساب ──
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const parsed = dispatchCourierSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const order = await loadOwnedOrder(params.id, storeId);
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (order.fulfillmentMethod !== "SHIPPING") {
      return NextResponse.json({ error: "الطلب استلام من المتجر — لا يحتاج مندوب" }, { status: 400 });
    }
    if (!DISPATCHABLE.includes(order.status)) {
      return NextResponse.json({ error: "أكّدي الطلب أو ابدئي تجهيزه قبل إرساله للمندوب" }, { status: 400 });
    }

    const courier = await prisma.cityCourier.findFirst({
      where: { id: parsed.data.courierId, isActive: true, city: { equals: order.shippingCity.trim(), mode: "insensitive" } },
      select: { id: true, name: true, phone: true },
    });
    if (!courier) return NextResponse.json({ error: "المندوب غير متاح لمدينة هذا الطلب" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      const existing = await tx.shipment.findFirst({
        where: { orderId: order.id, status: { notIn: [...INACTIVE_SHIPMENT] } },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        await tx.shipment.update({ where: { id: existing.id }, data: { courierId: courier.id, carrier: COURIER_CARRIER_LABEL } });
        await tx.shipmentEvent.create({ data: { shipmentId: existing.id, status: existing.status, note: `أُسندت الشحنة إلى ${courier.name}` } });
      } else {
        await tx.shipment.create({
          data: {
            orderId: order.id, courierId: courier.id, carrier: COURIER_CARRIER_LABEL, status: "PENDING",
            events: { create: { status: "PENDING", note: `أُسندت الشحنة إلى ${courier.name}` } },
          },
        });
      }
    });

    const waUrl = buildWhatsAppUrl(courier.phone, buildCourierMessage(order, order.store));
    return NextResponse.json({ waUrl, courierName: courier.name });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/orders/[id]/courier]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
