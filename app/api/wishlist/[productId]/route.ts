// app/api/wishlist/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

interface Params {
  params: { productId: string };
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId: params.productId },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/wishlist/:productId]", err);
    return NextResponse.json({ error: "تعذّر حذف المنتج من المفضلة" }, { status: 500 });
  }
}
