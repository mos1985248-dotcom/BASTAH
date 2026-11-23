import { requireStoreFeature } from "@/lib/feature-access";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VAT_RATE } from "@/lib/tax";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { storeId } = await requireStoreFeature("pricing");
    const subscription = await prisma.storeSubscription.findUnique({
      where: { storeId },
      select: { hasTaxNumber: true },
    });
    return NextResponse.json({
      vatRate: subscription?.hasTaxNumber ? String(VAT_RATE * 100) : "0",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/products/pricing-context]", error);
    return NextResponse.json({ error: "تعذّر تحميل إعداد الضريبة" }, { status: 500 });
  }
}
