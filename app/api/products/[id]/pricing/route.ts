import { requireStoreFeature } from "@/lib/feature-access";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VAT_RATE } from "@/lib/tax";
import { readPricingInputs } from "@/lib/pricing/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { storeId } = await requireStoreFeature("pricing");
    const product = await prisma.product.findFirst({
      where: { id: params.id, storeId },
      select: {
        pricing: { select: { inputs: true, updatedAt: true } },
        store: { select: { subscription: { select: { hasTaxNumber: true } } } },
      },
    });
    if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    const pricing = product.pricing && {
      input: readPricingInputs(product.pricing.inputs),
      updatedAt: product.pricing.updatedAt,
    };
    const vatRate = product.store.subscription?.hasTaxNumber ? String(VAT_RATE * 100) : "0";
    return NextResponse.json({ pricing, vatRate }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/products/:id/pricing]", error);
    return NextResponse.json({ error: "تعذّر تحميل بيانات التسعير" }, { status: 500 });
  }
}
