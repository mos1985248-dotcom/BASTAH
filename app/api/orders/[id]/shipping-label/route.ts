// app/api/orders/[id]/shipping-label/route.ts
// GET → PDF بوليصة شحن بسطة (10×15 سم) لطلب مُسنَد لمندوب بسطة للشحن.
// التاجر أو الإدارة فقط، ولا يعمل إلا إذا كان للطلب شحنة مندوب فعلية —
// نفس القيد المعروض بزر الطباعة في لوحة التاجر (راجع CourierDispatchCard).

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { ShippingLabelDocument, ShippingLabelItem } from "@/lib/pdf/shipping-label";

interface Params {
  params: { id: string };
}

const INACTIVE_SHIPMENT = ["FAILED", "RETURNED"] as const;

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true, orderNumber: true, createdAt: true, paymentMethod: true, total: true,
        shippingName: true, shippingPhone: true, shippingCity: true, shippingAddress: true,
        storeId: true,
        store: { select: { userId: true, nameAr: true, city: true, whatsapp: true } },
        items: {
          select: {
            nameAr: true, quantity: true,
            variant: { select: { options: true } },
          },
        },
        shipments: {
          where: { courierId: { not: null }, status: { notIn: [...INACTIVE_SHIPMENT] } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const isOwnerSeller = order.store.userId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (!isOwnerSeller && !isAdmin) {
      return NextResponse.json({ error: "لا تملكين صلاحية طباعة بوليصة هذا الطلب" }, { status: 403 });
    }

    // ⚠️ البوليصة لشحن بسطة (مناديب) فقط — لا لشحنات الشركات الأخرى ولا الاستلام من المتجر
    if (order.shipments.length === 0) {
      return NextResponse.json(
        { error: "هذا الطلب غير مُسنَد لمندوب بسطة للشحن — لا توجد بوليصة لطباعتها" },
        { status: 400 }
      );
    }

    const qrDataUrl = await QRCode.toDataURL(order.orderNumber, { margin: 0, width: 240 });

    const items: ShippingLabelItem[] = order.items.map((it) => {
      const opts = (it.variant?.options as { name: string; value: string }[] | null) ?? null;
      return {
        nameAr: it.nameAr,
        quantity: it.quantity,
        variantLabel: opts && opts[0] ? `${opts[0].name}: ${opts[0].value}` : null,
      };
    });

    const pdfBuffer = await renderToBuffer(
      ShippingLabelDocument({
        data: {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt.toISOString().slice(0, 10),
          storeName: order.store.nameAr,
          storeCity: order.store.city,
          storeWhatsapp: order.store.whatsapp,
          recipientName: order.shippingName,
          recipientPhone: order.shippingPhone,
          city: order.shippingCity,
          address: order.shippingAddress,
          isCod: order.paymentMethod === "CASH_ON_DELIVERY",
          codAmount: order.paymentMethod === "CASH_ON_DELIVERY" ? order.total : null,
          qrDataUrl,
          items,
        },
      })
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="basita-label-${order.orderNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/orders/[id]/shipping-label]", err);
    return NextResponse.json({ error: "تعذّر توليد بوليصة الشحن" }, { status: 500 });
  }
}
