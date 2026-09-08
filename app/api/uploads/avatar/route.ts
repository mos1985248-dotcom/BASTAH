// app/api/uploads/avatar/route.ts
// رفع الصورة الشخصية. multipart/form-data: { file }

import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { uploadAvatar, UserImageError } from "@/lib/user-images";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ملف الصورة مطلوب" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const updated = await uploadAvatar({ userId: user.id, fileBuffer });

    return NextResponse.json({ user: updated }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof UserImageError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/uploads/avatar]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء رفع الصورة" }, { status: 500 });
  }
}
