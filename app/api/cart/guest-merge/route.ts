import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AuthError, requireUser } from "@/lib/auth";

const itemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().min(1).max(99),
});
const schema = z.object({ userId: z.string().cuid(), items: z.array(itemSchema).max(50) });

export async function POST(req: NextRequest) {
  if (process.env.GUEST_CHECKOUT_ENABLED !== "true") {
    return NextResponse.json({ error: "سلة الزائر غير متاحة" }, { status: 503 });
  }
  if (req.headers.get("origin") !== req.nextUrl.origin) {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 403 });
  }

  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "بيانات السلة غير صالحة" }, { status: 400 });

    if (parsed.data.userId !== user.id) return NextResponse.json({ error: "الحساب تغيّر" }, { status: 403 });
    const items = parsed.data.items;
    const imported = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((line) => line.productId) }, status: "ACTIVE", store: { status: "ACTIVE" } },
        select: { id: true, quantity: true, variants: { select: { id: true, quantity: true } } },
      });
      const byId = new Map(products.map((product) => [product.id, product]));
      const merged: typeof items = [];
      for (const line of items) {
        const product = byId.get(line.productId);
        if (!product) continue;
        const available = line.variantId
          ? product.variants.find(({ id }) => id === line.variantId)?.quantity
          : product.variants.length === 0 ? product.quantity : undefined;
        if (!available) continue;

        const where = { userId: user.id, productId: line.productId, variantId: line.variantId ?? null };
        const existing = await tx.cartItem.findFirst({ where, select: { id: true, quantity: true } });
        const quantity = Math.min(line.quantity, available);
        // Taking the larger quantity makes response-loss retries idempotent.
        if (!existing) await tx.cartItem.create({ data: { ...where, quantity } });
        else if (existing.quantity < quantity) await tx.cartItem.update({ where: { id: existing.id }, data: { quantity } });
        merged.push(line);
      }
      return merged;
    }, { isolationLevel: "Serializable" });

    return NextResponse.json({ imported });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") {
      return NextResponse.json({ error: "تحدّثت السلة، حاول مجددًا" }, { status: 409 });
    }
    return NextResponse.json({ error: "تعذّر دمج السلة" }, { status: 500 });
  }
}
