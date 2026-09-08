// app/api/uploads/store/route.ts
// رفع شعار/غلاف المتجر. multipart/form-data: { slug, field: "logo"|"cover", file }
//
// لاحظي: هذا الـ route يجب أن يعمل على Node.js runtime (الافتراضي) لا Edge،
// لأن sharp يستخدم native bindings غير متوافقة مع Edge runtime.

import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { uploadStoreImage, StoreImageError, type StoreImageField } from "@/lib/store-images";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const formData = await req.formData();
    const slug = formData.get("slug");
    const field = formData.get("field");
    const file = formData.get("file");

    if (typeof slug !== "string" || !slug) {
      return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });
    }
    if (field !== "logo" && field !== "cover") {
      return NextResponse.json({ error: "field يجب أن يكون logo أو cover" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ملف الصورة مطلوب" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const store = await uploadStoreImage({
      slug,
      userId: user.id,
      userRole: user.role,
      field: field as StoreImageField,
      fileBuffer,
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof StoreImageError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/uploads/store]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء رفع الصورة" }, { status: 500 });
  }
}
