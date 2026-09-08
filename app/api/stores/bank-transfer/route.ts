// app/api/stores/bank-transfer/route.ts
// التاجر يفعّل استقبال دفعات المشترين عبر تحويل بنكي مباشر لحسابه —
// بديل ذاتي الخدمة لـMoyasar، بدون أي موافقة إدارية مسبقة (الهدف تسهيل
// الدخول، بالذات لتاجر الباقة المجانية بدون بوابة دفع). لا تشفير على
// الآيبان (بعكس مفتاح Moyasar السري) — بيانات تُعرض للمشتري وقت الدفع.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { bankTransferSetupSchema, formatZodError } from "@/lib/validation";
import { logAudit, getClientIp } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  try {
    const { user, storeId } = await requireActiveStore();

    const body = await req.json();
    const parsed = bankTransferSetupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { iban, accountHolder, bankName } = parsed.data;

    await prisma.storeSubscription.update({
      where: { storeId },
      data: {
        bankTransferEnabled: true,
        bankTransferIban: iban,
        bankTransferAccountHolder: accountHolder,
        bankTransferBankName: bankName,
      },
    });

    await logAudit({
      actorId: user.id,
      action: "SUBSCRIPTION_CHANGED",
      targetType: "Store",
      targetId: storeId,
      metadata: { event: "bank_transfer_enabled" },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({ enabled: true, bankName, accountHolder, ibanPreview: `${iban.slice(0, 6)}••••••••${iban.slice(-4)}` });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/stores/bank-transfer]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── GET — حالة التفعيل الحالية ──
export async function GET() {
  try {
    const { storeId } = await requireActiveStore();

    const sub = await prisma.storeSubscription.findUnique({
      where: { storeId },
      select: { bankTransferEnabled: true, bankTransferIban: true, bankTransferAccountHolder: true, bankTransferBankName: true },
    });

    return NextResponse.json({
      enabled: sub?.bankTransferEnabled ?? false,
      accountHolder: sub?.bankTransferAccountHolder ?? null,
      bankName: sub?.bankTransferBankName ?? null,
      ibanPreview: sub?.bankTransferIban ? `${sub.bankTransferIban.slice(0, 6)}••••••••${sub.bankTransferIban.slice(-4)}` : null,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/stores/bank-transfer]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── DELETE — تعطيل التحويل البنكي (لا يمسح الآيبان، فقط يوقف قبوله كطريقة دفع) ──
export async function DELETE(req: NextRequest) {
  try {
    const { user, storeId } = await requireActiveStore();

    await prisma.storeSubscription.update({
      where: { storeId },
      data: { bankTransferEnabled: false },
    });

    await logAudit({
      actorId: user.id,
      action: "SUBSCRIPTION_CHANGED",
      targetType: "Store",
      targetId: storeId,
      metadata: { event: "bank_transfer_disabled" },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({ enabled: false });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/stores/bank-transfer]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
