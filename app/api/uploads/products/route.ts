// app/api/uploads/products/route.ts
// رفع صورة منتج جديدة. multipart/form-data: { productId, file }
//
// لاحظي: هذا الـ route يجب أن يعمل على Node.js runtime (الافتراضي) لا Edge،
// لأن sharp يستخدم native bindings غير متوافقة مع Edge runtime.

import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { uploadProductImage, ProductImageError } from "@/lib/product-images";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const formData = await req.formData();
    const productId = formData.get("productId");
    const file = formData.get("file");

    if (typeof productId !== "string" || !productId) {
      return NextResponse.json({ error: "productId مطلوب" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ملف الصورة مطلوب" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const image = await uploadProductImage({
      productId,
      userId: user.id,
      userRole: user.role,
      fileBuffer,
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof ProductImageError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/uploads/products]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء رفع الصورة" }, { status: 500 });
  }
}
