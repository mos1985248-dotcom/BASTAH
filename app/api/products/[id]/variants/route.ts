// app/api/products/[id]/variants/route.ts
// حفظ متغيرات المنتج دفعة واحدة (مزامنة: تحديث بالـid، إنشاء بدونه، حذف الغائب).
// ⚠️ قاعدة المخزون: reserveStock يخصم من المتغيّر ومن Product.quantity معاً،
// لذلك كمية المنتج = مجموع كميات متغيراته دائماً، وتُحسب هنا داخل نفس الـtransaction.
// لا تغيير على schema: ProductVariant موجود، وnameAr = قيمة الخيار، وoptions = [{ name, value }].

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { productVariantsSchema, formatZodError } from "@/lib/validation";

interface Params {
  params: { id: string };
}

const VARIANT_SELECT = { id: true, options: true, price: true, quantity: true, sku: true } as const;

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireActiveStore();
    const parsed = productVariantsSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    const { optionName, variants } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true, storeId: true, status: true,
        variants: { select: { id: true, nameAr: true, _count: { select: { orderItems: true } } } },
      },
    });
    if (!product || product.storeId !== storeId) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    const existingIds = new Set(product.variants.map((v) => v.id));
    if (variants.some((v) => v.id && !existingIds.has(v.id))) {
      return NextResponse.json({ error: "متغيّر غير تابع لهذا المنتج" }, { status: 400 });
    }

    const keptIds = new Set(variants.filter((v) => v.id).map((v) => v.id as string));
    const removed = product.variants.filter((v) => !keptIds.has(v.id));
    // لا schema جديدة = لا حقل "معطّل": المتغيّر المرتبط بطلبات لا يُحذف، يُصفَّر مخزونه بدلاً من ذلك
    const blocked = removed.find((v) => v._count.orderItems > 0);
    if (blocked) {
      return NextResponse.json(
        { error: `لا يمكن حذف «${blocked.nameAr}» لأنه مرتبط بطلبات سابقة — اجعلي كميته 0 بدلاً من حذفه` },
        { status: 409 }
      );
    }

    const baseTime = Date.now();
    const saved = await prisma.$transaction(async (tx) => {
      if (removed.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: removed.map((v) => v.id) }, productId: product.id } });
      }

      for (const [index, v] of variants.entries()) {
        const data = {
          nameAr: v.value,
          options: [{ name: optionName, value: v.value }],
          price: v.price ?? null,
          quantity: v.quantity,
          sku: v.sku || null,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data });
        } else {
          // createdAt متدرّج بالميلي ثانية ليثبت ترتيب S/M/L كما أدخلها التاجر
          await tx.productVariant.create({ data: { ...data, productId: product.id, createdAt: new Date(baseTime + index) } });
        }
      }

      const list = await tx.productVariant.findMany({
        where: { productId: product.id },
        select: VARIANT_SELECT,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });

      if (list.length > 0) {
        const total = list.reduce((sum, v) => sum + v.quantity, 0);
        // نفس اتفاقية inventory.ts: نفاد المخزون ↔ OUT_OF_STOCK، وعودته ↔ ACTIVE (لا نلمس DRAFT/ARCHIVED)
        const status =
          total === 0 && product.status === "ACTIVE" ? "OUT_OF_STOCK"
          : total > 0 && product.status === "OUT_OF_STOCK" ? "ACTIVE"
          : undefined;
        await tx.product.update({ where: { id: product.id }, data: { quantity: total, ...(status ? { status } : {}) } });
      }
      return list;
    });

    return NextResponse.json({ variants: saved });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/products/[id]/variants]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
