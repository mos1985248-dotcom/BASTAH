// app/api/uploads/products/[imageId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import {
  deleteProductImage,
  replaceProductImage,
  updateProductImageMeta,
  ProductImageError,
} from "@/lib/product-images";
import { updateImageMetaSchema, formatZodError } from "@/lib/validation";

interface Params {
  params: { imageId: string };
}

// ── PATCH — تحديث الترتيب أو تعيين كغلاف (JSON) ─────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = updateImageMetaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    await updateProductImageMeta({
      imageId: params.imageId,
      userId: user.id,
      userRole: user.role,
      position: parsed.data.position,
      isCover: parsed.data.isCover,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof ProductImageError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[PATCH /api/uploads/products/:imageId]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── PUT — استبدال محتوى الصورة (multipart: file) ────────
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ملف الصورة مطلوب" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const image = await replaceProductImage({
      imageId: params.imageId,
      userId: user.id,
      userRole: user.role,
      fileBuffer,
    });

    return NextResponse.json({ image });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof ProductImageError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[PUT /api/uploads/products/:imageId]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء استبدال الصورة" }, { status: 500 });
  }
}

// ── DELETE — حذف الصورة وتنظيف التخزين ──────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    await deleteProductImage({ imageId: params.imageId, userId: user.id, userRole: user.role });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof ProductImageError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[DELETE /api/uploads/products/:imageId]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
