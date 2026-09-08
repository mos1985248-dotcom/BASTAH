// app/api/orders/[id]/bank-transfer-proof/route.ts
// multipart/form-data: { referenceNumber, file }
//
// خطوة تالية لطلب بطريقة BANK_TRANSFER — المشتري يسوّي التحويل فعلياً
// خارج المنصة، ثم يرجع يرفع رقم مرجعي + صورة إثبات هنا. لا يُفعّل الطلب
// بنفسه — التاجر (أو الإدارة إشرافياً) يراجع من لوحته ويؤكّد الطلب
// (PATCH /api/orders/[id] status=CONFIRMED) لتتحوّل paymentStatus تلقائياً PAID.

import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { submitOrderBankTransferProof, OrderBankTransferError } from "@/lib/order-bank-transfer";
import { z } from "zod";

const bodySchema = z.object({
  referenceNumber: z.string().trim().min(3, "الرقم المرجعي قصير جداً").max(100),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const formData = await req.formData();
    const parsed = bodySchema.safeParse({ referenceNumber: formData.get("referenceNumber") });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "صورة إثبات التحويل مطلوبة" }, { status: 400 });
    }
    const proofImageBuffer = Buffer.from(await file.arrayBuffer());

    const updated = await submitOrderBankTransferProof({
      orderId: params.id,
      buyerId: user.id,
      referenceNumber: parsed.data.referenceNumber,
      proofImageBuffer,
    });

    return NextResponse.json({ order: updated }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof OrderBankTransferError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/orders/[id]/bank-transfer-proof]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
