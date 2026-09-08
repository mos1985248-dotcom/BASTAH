// app/api/orders/[id]/verify-payment/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي) — "تحقق موثوق من API" حسب طلب أحمد
// صراحة: لا نعتبر نجاح الـredirect بالمتصفح دليلاً نهائياً على نجاح الدفع.
// تُستدعى من صفحة تأكيد الطلب لو paymentStatus ما زال PENDING بعد الرجوع
// من صفحة الدفع — تجلب الفاتورة مباشرة من Moyasar وتُطبّق نفس منطق
// applyMoyasarPaymentStatus المستخدم بالـwebhook (نفس القواعد، لا تكرار).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { fetchMoyasarInvoice, MoyasarError } from "@/lib/moyasar";
import { decryptSecret } from "@/lib/crypto";
import { applyMoyasarPaymentStatus } from "@/lib/order-payment";

interface Params {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true, buyerId: true, storeId: true, moyasarTxnId: true, paymentStatus: true, status: true, paymentMethod: true,
        store: { select: { subscription: { select: { merchantMoyasarSecretKeyEnc: true } } } },
      },
    });
    if (!order || order.buyerId !== user.id) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (order.paymentMethod === "CASH_ON_DELIVERY") {
      return NextResponse.json({ paymentStatus: order.paymentStatus, orderStatus: order.status });
    }

    if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED" || !order.moyasarTxnId) {
      // مؤكَّدة مسبقاً (غالباً عبر الـwebhook) أو لا توجد فاتورة لنتحقق منها
      return NextResponse.json({ paymentStatus: order.paymentStatus, orderStatus: order.status });
    }

    const secretKeyEnc = order.store.subscription?.merchantMoyasarSecretKeyEnc;
    if (!secretKeyEnc) {
      return NextResponse.json({ paymentStatus: order.paymentStatus, orderStatus: order.status });
    }

    const secretKey = decryptSecret(secretKeyEnc);
    const invoice = await fetchMoyasarInvoice(secretKey, order.moyasarTxnId);

    // آخر دفعة فعلية مسجَّلة على الفاتورة (لو وُجدت) هي مصدر الحقيقة
    const latestPayment = invoice.payments?.[invoice.payments.length - 1];
    const effectiveStatus = latestPayment?.status ?? invoice.status;

    const result = await applyMoyasarPaymentStatus(order.id, effectiveStatus);
    return NextResponse.json({
      paymentStatus: result.paymentStatus || order.paymentStatus,
      orderStatus: result.orderStatus || order.status,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof MoyasarError) return NextResponse.json({ error: "تعذّر التحقق من حالة الدفع الآن" }, { status: 502 });
    console.error("[POST /api/orders/:id/verify-payment]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
