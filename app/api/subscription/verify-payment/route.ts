// app/api/subscription/verify-payment/route.ts
// "تحقق موثوق من API" — لا نعتبر نجاح الـredirect من Moyasar دليلاً نهائياً.
// تُستدعى من صفحة العودة (dashboard/subscription/return) لو الفاتورة ما
// زالت PENDING بعد الرجوع — نفس نمط orders/[id]/verify-payment حرفياً.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { fetchMoyasarInvoice, MoyasarError, toHalalas } from "@/lib/moyasar";
import { applyMoyasarSubscriptionPaymentStatus } from "@/lib/subscription-payment";
import { isMoyasarInvoiceReference } from "@/lib/subscription-invoice-reference";
import { z } from "zod";

const bodySchema = z.object({ invoiceId: z.string().cuid() });

export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "معرّف الفاتورة مطلوب" }, { status: 400 });
    }

    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id: parsed.data.invoiceId },
      select: { id: true, status: true, amount: true, moyasarTxnId: true, subscription: { select: { storeId: true, status: true, plan: true } } },
    });

    if (!invoice || invoice.subscription.storeId !== storeId) {
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    }

    if (invoice.status === "PAID" || !isMoyasarInvoiceReference(invoice.moyasarTxnId)) {
      return NextResponse.json({ invoiceStatus: invoice.status, subscriptionStatus: invoice.subscription.status, plan: invoice.subscription.plan });
    }

    if (!process.env.PLATFORM_MOYASAR_SECRET_KEY) {
      return NextResponse.json({ error: "بوابة دفع المنصة غير مُهيَّأة" }, { status: 503 });
    }

    const moyasarInvoice = await fetchMoyasarInvoice(process.env.PLATFORM_MOYASAR_SECRET_KEY, invoice.moyasarTxnId, AbortSignal.timeout(10_000));
    if (moyasarInvoice.id !== invoice.moyasarTxnId || moyasarInvoice.currency !== "SAR" || moyasarInvoice.amount !== toHalalas(invoice.amount)) {
      return NextResponse.json({ error: "بيانات فاتورة الدفع لا تطابق الاشتراك." }, { status: 409 });
    }
    const latestPayment = moyasarInvoice.payments?.[moyasarInvoice.payments.length - 1];
    const effectiveStatus = moyasarInvoice.status === "paid" ? "paid" : latestPayment?.status ?? moyasarInvoice.status;
    if (moyasarInvoice.status !== "paid" && ["paid", "captured"].includes(effectiveStatus) &&
      (latestPayment?.currency !== "SAR" || latestPayment.amount !== toHalalas(invoice.amount))) {
      return NextResponse.json({ error: "مبلغ الدفع لا يطابق فاتورة الاشتراك." }, { status: 409 });
    }

    const result = await applyMoyasarSubscriptionPaymentStatus(invoice.id, effectiveStatus, invoice.moyasarTxnId);

    const fresh = await prisma.storeSubscription.findUnique({ where: { storeId }, select: { plan: true, status: true } });
    return NextResponse.json({
      invoiceStatus: result.invoiceStatus || invoice.status,
      subscriptionStatus: fresh?.status ?? invoice.subscription.status,
      plan: fresh?.plan ?? invoice.subscription.plan,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof MoyasarError) return NextResponse.json({ error: "تعذّر التحقق من حالة الدفع الآن" }, { status: 502 });
    console.error("[POST /api/subscription/verify-payment]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
